use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("GcyrBWgTsxVjdtpXja1QYhJR3eHMBA43u51jPsD9jeKm");

#[program]
pub mod invest_apy {
    use super::*;

    /// Admin creates an RWA investment vault.
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        asset_id: u64,
        base_yield_bps: u64,
        bonus_yield_bps: u64,
        lockup_seconds: i64,
        min_deposit: u64,
        rwa_price_usdc: u64,
        idrx_rate: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.admin = ctx.accounts.admin.key();
        vault.usdc_mint = ctx.accounts.usdc_mint.key();
        vault.idrx_mint = ctx.accounts.idrx_mint.key();
        vault.rwa_mint = ctx.accounts.rwa_mint.key();
        vault.usdc_vault = ctx.accounts.usdc_token_vault.key();
        vault.idrx_vault = ctx.accounts.idrx_token_vault.key();
        vault.rwa_vault = ctx.accounts.rwa_token_vault.key();
        vault.asset_id = asset_id;
        vault.base_yield_bps = base_yield_bps;
        vault.bonus_yield_bps = bonus_yield_bps;
        vault.lockup_seconds = lockup_seconds;
        vault.min_deposit = min_deposit;
        vault.rwa_price_usdc = rwa_price_usdc;
        vault.idrx_rate = idrx_rate;
        vault.total_deposits_usdc = 0;
        vault.total_yield_distributed = 0;
        vault.bump = ctx.bumps.vault;
        Ok(())
    }

    /// User deposits USDC into the vault.
    pub fn deposit_usdc(ctx: Context<DepositUsdc>, amount: u64) -> Result<()> {
        require!(
            amount >= ctx.accounts.vault.min_deposit,
            InvestError::BelowMinimum
        );

        // Transfer USDC from user to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_usdc.to_account_info(),
                    to: ctx.accounts.usdc_token_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // Create or update user deposit
        let deposit = &mut ctx.accounts.user_deposit;
        let clock = Clock::get()?;

        if deposit.deposited_at == 0 {
            deposit.vault = ctx.accounts.vault.key();
            deposit.user = ctx.accounts.user.key();
            deposit.amount_usdc_equivalent = amount;
            deposit.original_amount = amount;
            deposit.deposit_currency = 0; // USDC
            deposit.deposited_at = clock.unix_timestamp;
            deposit.yield_claimed = 0;
            deposit.bump = ctx.bumps.user_deposit;
        } else {
            deposit.amount_usdc_equivalent = deposit
                .amount_usdc_equivalent
                .checked_add(amount)
                .unwrap();
            deposit.original_amount = deposit.original_amount.checked_add(amount).unwrap();
            deposit.deposited_at = clock.unix_timestamp;
        }

        // Update vault totals
        let vault = &mut ctx.accounts.vault;
        vault.total_deposits_usdc = vault.total_deposits_usdc.checked_add(amount).unwrap();

        Ok(())
    }

    /// User deposits IDRX into the vault (converted at idrx_rate for accounting).
    pub fn deposit_idrx(ctx: Context<DepositIdrx>, amount: u64) -> Result<()> {
        let idrx_rate = ctx.accounts.vault.idrx_rate;
        let min_deposit = ctx.accounts.vault.min_deposit;

        // Convert IDRX amount to USDC equivalent
        let usdc_equivalent = amount.checked_div(idrx_rate).unwrap_or(0);
        require!(usdc_equivalent >= min_deposit, InvestError::BelowMinimum);

        // Transfer IDRX from user to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_idrx.to_account_info(),
                    to: ctx.accounts.idrx_token_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // Create or update user deposit
        let deposit = &mut ctx.accounts.user_deposit;
        let clock = Clock::get()?;

        if deposit.deposited_at == 0 {
            deposit.vault = ctx.accounts.vault.key();
            deposit.user = ctx.accounts.user.key();
            deposit.amount_usdc_equivalent = usdc_equivalent;
            deposit.original_amount = amount;
            deposit.deposit_currency = 1; // IDRX
            deposit.deposited_at = clock.unix_timestamp;
            deposit.yield_claimed = 0;
            deposit.bump = ctx.bumps.user_deposit;
        } else {
            deposit.amount_usdc_equivalent = deposit
                .amount_usdc_equivalent
                .checked_add(usdc_equivalent)
                .unwrap();
            deposit.original_amount = deposit.original_amount.checked_add(amount).unwrap();
            deposit.deposited_at = clock.unix_timestamp;
        }

        let vault = &mut ctx.accounts.vault;
        vault.total_deposits_usdc = vault
            .total_deposits_usdc
            .checked_add(usdc_equivalent)
            .unwrap();

        Ok(())
    }

    /// Admin distributes yield to a depositor in RWA tokens.
    /// `rwa_amount` is the number of RWA token micro-units to distribute.
    pub fn distribute_yield(ctx: Context<DistributeYield>, rwa_amount: u64) -> Result<()> {
        require!(rwa_amount > 0, InvestError::ZeroAmount);

        let asset_id_bytes = ctx.accounts.vault.asset_id.to_le_bytes();
        let bump = ctx.accounts.vault.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault", asset_id_bytes.as_ref(), &[bump]]];

        // Transfer RWA tokens from vault to user
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.rwa_token_vault.to_account_info(),
                    to: ctx.accounts.user_rwa.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
                signer_seeds,
            ),
            rwa_amount,
        )?;

        // Update bookkeeping
        let deposit = &mut ctx.accounts.user_deposit;
        deposit.yield_claimed = deposit.yield_claimed.checked_add(rwa_amount).unwrap();

        let vault = &mut ctx.accounts.vault;
        vault.total_yield_distributed = vault
            .total_yield_distributed
            .checked_add(rwa_amount)
            .unwrap();

        Ok(())
    }

    /// User withdraws deposited principal after lockup expires.
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let clock = Clock::get()?;
        let lockup_seconds = ctx.accounts.vault.lockup_seconds;
        let deposited_at = ctx.accounts.user_deposit.deposited_at;
        let deposit_currency = ctx.accounts.user_deposit.deposit_currency;
        let withdraw_amount = ctx.accounts.user_deposit.original_amount;
        let usdc_eq = ctx.accounts.user_deposit.amount_usdc_equivalent;

        // Check lockup
        let unlock_time = deposited_at.checked_add(lockup_seconds).unwrap();
        require!(
            clock.unix_timestamp >= unlock_time,
            InvestError::LockupNotExpired
        );
        require!(withdraw_amount > 0, InvestError::ZeroAmount);

        let asset_id_bytes = ctx.accounts.vault.asset_id.to_le_bytes();
        let bump = ctx.accounts.vault.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault", asset_id_bytes.as_ref(), &[bump]]];

        if deposit_currency == 0 {
            // Withdraw USDC
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.usdc_token_vault.to_account_info(),
                        to: ctx.accounts.user_token_out.to_account_info(),
                        authority: ctx.accounts.vault.to_account_info(),
                    },
                    signer_seeds,
                ),
                withdraw_amount,
            )?;
        } else {
            // Withdraw IDRX
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.idrx_token_vault.to_account_info(),
                        to: ctx.accounts.user_token_out.to_account_info(),
                        authority: ctx.accounts.vault.to_account_info(),
                    },
                    signer_seeds,
                ),
                withdraw_amount,
            )?;
        }

        // Update vault totals
        let vault = &mut ctx.accounts.vault;
        vault.total_deposits_usdc = vault.total_deposits_usdc.checked_sub(usdc_eq).unwrap_or(0);

        // Reset user deposit
        let deposit = &mut ctx.accounts.user_deposit;
        deposit.amount_usdc_equivalent = 0;
        deposit.original_amount = 0;
        deposit.deposited_at = 0;

        Ok(())
    }

    /// Admin updates the APY rates on a vault.
    pub fn update_vault_apy(
        ctx: Context<UpdateVault>,
        base_yield_bps: u64,
        bonus_yield_bps: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.base_yield_bps = base_yield_bps;
        vault.bonus_yield_bps = bonus_yield_bps;
        Ok(())
    }

    /// Admin updates the IDRX/USDC exchange rate.
    pub fn update_idrx_rate(ctx: Context<UpdateVault>, new_rate: u64) -> Result<()> {
        require!(new_rate > 0, InvestError::ZeroAmount);
        let vault = &mut ctx.accounts.vault;
        vault.idrx_rate = new_rate;
        Ok(())
    }

    /// Admin updates the RWA token price in USDC.
    pub fn update_rwa_price(ctx: Context<UpdateVault>, new_price: u64) -> Result<()> {
        require!(new_price > 0, InvestError::ZeroAmount);
        let vault = &mut ctx.accounts.vault;
        vault.rwa_price_usdc = new_price;
        Ok(())
    }
}

// ============================================================
// Accounts
// ============================================================

#[derive(Accounts)]
#[instruction(asset_id: u64)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", asset_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    pub usdc_mint: Account<'info, Mint>,
    pub idrx_mint: Account<'info, Mint>,
    pub rwa_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        token::mint = usdc_mint,
        token::authority = vault,
        seeds = [b"usdc_vault", vault.key().as_ref()],
        bump
    )]
    pub usdc_token_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = admin,
        token::mint = idrx_mint,
        token::authority = vault,
        seeds = [b"idrx_vault", vault.key().as_ref()],
        bump
    )]
    pub idrx_token_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = admin,
        token::mint = rwa_mint,
        token::authority = vault,
        seeds = [b"rwa_vault", vault.key().as_ref()],
        bump
    )]
    pub rwa_token_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct DepositUsdc<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserDeposit::INIT_SPACE,
        seeds = [b"deposit", vault.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, constraint = user_usdc.mint == vault.usdc_mint)]
    pub user_usdc: Account<'info, TokenAccount>,

    #[account(mut, constraint = usdc_token_vault.key() == vault.usdc_vault)]
    pub usdc_token_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositIdrx<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserDeposit::INIT_SPACE,
        seeds = [b"deposit", vault.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, constraint = user_idrx.mint == vault.idrx_mint)]
    pub user_idrx: Account<'info, TokenAccount>,

    #[account(mut, constraint = idrx_token_vault.key() == vault.idrx_vault)]
    pub idrx_token_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeYield<'info> {
    #[account(mut, has_one = admin)]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [b"deposit", vault.key().as_ref(), depositor.key().as_ref()],
        bump = user_deposit.bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    #[account(mut, constraint = rwa_token_vault.key() == vault.rwa_vault)]
    pub rwa_token_vault: Account<'info, TokenAccount>,

    /// The user's RWA token account to receive yield
    #[account(mut)]
    pub user_rwa: Account<'info, TokenAccount>,

    /// CHECK: used only for PDA derivation
    pub depositor: UncheckedAccount<'info>,

    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(
        mut,
        seeds = [b"deposit", vault.key().as_ref(), user.key().as_ref()],
        bump = user_deposit.bump,
        has_one = user
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// The token account to receive withdrawn funds (USDC or IDRX)
    #[account(mut)]
    pub user_token_out: Account<'info, TokenAccount>,

    #[account(mut, constraint = usdc_token_vault.key() == vault.usdc_vault)]
    pub usdc_token_vault: Account<'info, TokenAccount>,

    #[account(mut, constraint = idrx_token_vault.key() == vault.idrx_vault)]
    pub idrx_token_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateVault<'info> {
    #[account(mut, has_one = admin)]
    pub vault: Account<'info, Vault>,
    pub admin: Signer<'info>,
}

// ============================================================
// State
// ============================================================

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub admin: Pubkey,                // 32
    pub usdc_mint: Pubkey,            // 32
    pub idrx_mint: Pubkey,            // 32
    pub rwa_mint: Pubkey,             // 32
    pub usdc_vault: Pubkey,           // 32
    pub idrx_vault: Pubkey,           // 32
    pub rwa_vault: Pubkey,            // 32
    pub asset_id: u64,                // 8
    pub base_yield_bps: u64,          // 8
    pub bonus_yield_bps: u64,         // 8
    pub lockup_seconds: i64,          // 8
    pub min_deposit: u64,             // 8
    pub rwa_price_usdc: u64,          // 8
    pub idrx_rate: u64,               // 8
    pub total_deposits_usdc: u64,     // 8
    pub total_yield_distributed: u64, // 8
    pub bump: u8,                     // 1
}

#[account]
#[derive(InitSpace)]
pub struct UserDeposit {
    pub vault: Pubkey,               // 32
    pub user: Pubkey,                // 32
    pub amount_usdc_equivalent: u64, // 8
    pub original_amount: u64,        // 8
    pub deposit_currency: u8,        // 1  (0 = USDC, 1 = IDRX)
    pub deposited_at: i64,           // 8
    pub yield_claimed: u64,          // 8
    pub bump: u8,                    // 1
}

// ============================================================
// Errors
// ============================================================

#[error_code]
pub enum InvestError {
    #[msg("Deposit amount is below the vault minimum")]
    BelowMinimum,
    #[msg("Lockup period has not expired")]
    LockupNotExpired,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Unauthorized")]
    Unauthorized,
}

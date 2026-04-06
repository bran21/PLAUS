use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("G2C4aXbXvPQRq2vyLKrjQskxskEVAehNepaSiEnRPvpF");

#[program]
pub mod mock_amm {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.mint_a = ctx.accounts.mint_a.key();
        pool.mint_b = ctx.accounts.mint_b.key();
        pool.vault_a = ctx.accounts.vault_a.key();
        pool.vault_b = ctx.accounts.vault_b.key();
        pool.bump = ctx.bumps.pool;
        pool.reserve_a = 0;
        pool.reserve_b = 0;
        Ok(())
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_a: u64, amount_b: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_a.to_account_info(),
                    to: ctx.accounts.vault_a.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_a,
        )?;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_b.to_account_info(),
                    to: ctx.accounts.vault_b.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount_b,
        )?;

        pool.reserve_a = pool.reserve_a.checked_add(amount_a).unwrap();
        pool.reserve_b = pool.reserve_b.checked_add(amount_b).unwrap();
        
        Ok(())
    }

    pub fn swap(ctx: Context<Swap>, amount_in: u64, is_a_to_b: bool) -> Result<()> {
        let pool = &mut ctx.accounts.pool;

        let reserve_in = if is_a_to_b { pool.reserve_a } else { pool.reserve_b };
        let reserve_out = if is_a_to_b { pool.reserve_b } else { pool.reserve_a };

        // simple CPMM: out = (res_out * in) / (res_in + in)
        let amount_out = (reserve_out as u128)
            .checked_mul(amount_in as u128)
            .unwrap()
            .checked_div((reserve_in as u128).checked_add(amount_in as u128).unwrap())
            .unwrap() as u64;

        if amount_out == 0 {
            return err!(ErrorCode::ZeroOutput);
        }

        let pool_key = pool.key();
        let mint_a = pool.mint_a.as_ref();
        let mint_b = pool.mint_b.as_ref();
        let bump = pool.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"pool",
            mint_a,
            mint_b,
            &[bump],
        ]];

        if is_a_to_b {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.user_in.to_account_info(),
                        to: ctx.accounts.vault_a.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                amount_in,
            )?;
            
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.vault_b.to_account_info(),
                        to: ctx.accounts.user_out.to_account_info(),
                        authority: pool.to_account_info(),
                    },
                    signer_seeds
                ),
                amount_out,
            )?;

            pool.reserve_a = pool.reserve_a.checked_add(amount_in).unwrap();
            pool.reserve_b = pool.reserve_b.checked_sub(amount_out).unwrap();

        } else {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.user_in.to_account_info(),
                        to: ctx.accounts.vault_b.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                amount_in,
            )?;
            
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.vault_a.to_account_info(),
                        to: ctx.accounts.user_out.to_account_info(),
                        authority: pool.to_account_info(),
                    },
                    signer_seeds
                ),
                amount_out,
            )?;

            pool.reserve_b = pool.reserve_b.checked_add(amount_in).unwrap();
            pool.reserve_a = pool.reserve_a.checked_sub(amount_out).unwrap();
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 32 + 32 + 1 + 8 + 8,
        seeds = [b"pool", mint_a.key().as_ref(), mint_b.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,
    
    pub mint_a: Account<'info, Mint>,
    pub mint_b: Account<'info, Mint>,
    
    #[account(
        init,
        payer = user,
        token::mint = mint_a,
        token::authority = pool,
        seeds = [b"vault_a", pool.key().as_ref()],
        bump
    )]
    pub vault_a: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = user,
        token::mint = mint_b,
        token::authority = pool,
        seeds = [b"vault_b", pool.key().as_ref()],
        bump
    )]
    pub vault_b: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_b: Account<'info, TokenAccount>,
    
    #[account(mut, constraint = vault_a.key() == pool.vault_a)]
    pub vault_a: Account<'info, TokenAccount>,
    #[account(mut, constraint = vault_b.key() == pool.vault_b)]
    pub vault_b: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_in: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_out: Account<'info, TokenAccount>,
    
    #[account(mut, constraint = vault_a.key() == pool.vault_a)]
    pub vault_a: Account<'info, TokenAccount>,
    #[account(mut, constraint = vault_b.key() == pool.vault_b)]
    pub vault_b: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Pool {
    pub mint_a: Pubkey,
    pub mint_b: Pubkey,
    pub vault_a: Pubkey,
    pub vault_b: Pubkey,
    pub bump: u8,
    pub reserve_a: u64,
    pub reserve_b: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Zero output amount")]
    ZeroOutput,
}

# Invest APY Contract

> Solana Anchor program for RWA investment with yield distribution in tokenized real-world assets.

**Program ID:** `GcyrBWgTsxVjdtpXja1QYhJR3eHMBA43u51jPsD9jeKm`  
**Framework:** Anchor 0.32.1  
**Network:** Solana Devnet  

---

## Overview

The `invest_apy` contract enables users to deposit stablecoins (USDC or IDRX) into RWA asset vaults and receive yield paid in tokenized RWA tokens ($JAVA, $SKYLN, $SGRID, etc.). Each vault is configured with a specific APY, lockup period, and minimum deposit.

### Key Design

- **Dual currency support** — Users deposit in USDC or IDRX, with IDRX converted at a configurable exchange rate
- **Yield in RWA tokens** — Yield is distributed in the vault's RWA token (e.g., $JAVA) at the configured price rate
- **Admin-controlled distribution** — Yield is distributed by the admin off-chain for MVP simplicity
- **Lockup enforcement** — Withdrawals are locked until the configured lockup period expires
- **Currency-aware withdrawal** — Users withdraw in their original deposit currency

---

## Architecture

```
User ──deposit_usdc──▶ Vault PDA
User ──deposit_idrx──▶ Vault PDA
                        │
                        ├── USDC Token Vault (holds deposited USDC)
                        ├── IDRX Token Vault (holds deposited IDRX)
                        └── RWA Token Vault  (holds RWA tokens for yield)
                                │
Admin ──distribute_yield──▶ RWA tokens → User
User  ──withdraw──────────▶ Principal returned in original currency
```

### PDA Seeds

| Account | Seeds |
|---------|-------|
| Vault | `["vault", asset_id.to_le_bytes()]` |
| UserDeposit | `["deposit", vault, user]` |
| USDC Token Vault | `["usdc_vault", vault]` |
| IDRX Token Vault | `["idrx_vault", vault]` |
| RWA Token Vault | `["rwa_vault", vault]` |

---

## Instructions

### `initialize_vault`
**Signer:** Admin

Creates an RWA investment vault with full configuration.

| Parameter | Type | Description |
|-----------|------|-------------|
| `asset_id` | `u64` | Unique asset ID (matches frontend) |
| `base_yield_bps` | `u64` | Base yield in basis points (1050 = 10.50%) |
| `bonus_yield_bps` | `u64` | Bonus yield in basis points (370 = 3.70%) |
| `lockup_seconds` | `i64` | Min lockup duration before withdrawal |
| `min_deposit` | `u64` | Minimum deposit (in token decimals) |
| `rwa_price_usdc` | `u64` | Price of 1 RWA token in USDC (6 decimals) |
| `idrx_rate` | `u64` | IDRX per 1 USDC (e.g., 15625) |

### `deposit_usdc`
**Signer:** User

Deposits USDC into the vault. Creates a `UserDeposit` PDA on first deposit, or adds to existing.

| Parameter | Type | Description |
|-----------|------|-------------|
| `amount` | `u64` | USDC amount in micro-units (6 decimals) |

### `deposit_idrx`
**Signer:** User

Deposits IDRX with automatic conversion at the vault's `idrx_rate` for internal accounting.

| Parameter | Type | Description |
|-----------|------|-------------|
| `amount` | `u64` | IDRX amount in micro-units (6 decimals) |

### `distribute_yield`
**Signer:** Admin

Sends RWA tokens from the vault's RWA reserve to a depositor as yield payment.

| Parameter | Type | Description |
|-----------|------|-------------|
| `rwa_amount` | `u64` | RWA tokens to distribute (6 decimals) |

### `withdraw`
**Signer:** User

Withdraws deposited principal after the lockup period has expired. Returns funds in the user's original deposit currency (USDC or IDRX).

### `update_vault_apy`
**Signer:** Admin

Updates the base and bonus yield rates on a vault.

### `update_idrx_rate`
**Signer:** Admin

Updates the IDRX/USDC exchange rate.

### `update_rwa_price`
**Signer:** Admin

Updates the RWA token price in USDC.

---

## Account Structures

### Vault (297 bytes)

| Field | Type | Description |
|-------|------|-------------|
| `admin` | `Pubkey` | Vault admin authority |
| `usdc_mint` | `Pubkey` | USDC token mint |
| `idrx_mint` | `Pubkey` | IDRX token mint |
| `rwa_mint` | `Pubkey` | RWA token mint (e.g., $JAVA) |
| `usdc_vault` | `Pubkey` | USDC token account PDA |
| `idrx_vault` | `Pubkey` | IDRX token account PDA |
| `rwa_vault` | `Pubkey` | RWA token account PDA |
| `asset_id` | `u64` | Unique asset identifier |
| `base_yield_bps` | `u64` | Base yield in basis points |
| `bonus_yield_bps` | `u64` | Bonus yield in basis points |
| `lockup_seconds` | `i64` | Lockup period in seconds |
| `min_deposit` | `u64` | Minimum deposit amount |
| `rwa_price_usdc` | `u64` | RWA token price in USDC |
| `idrx_rate` | `u64` | IDRX per USDC rate |
| `total_deposits_usdc` | `u64` | Total deposits (USDC equivalent) |
| `total_yield_distributed` | `u64` | Total RWA tokens distributed |
| `bump` | `u8` | PDA bump seed |

### UserDeposit (98 bytes)

| Field | Type | Description |
|-------|------|-------------|
| `vault` | `Pubkey` | Associated vault |
| `user` | `Pubkey` | Depositor's wallet |
| `amount_usdc_equivalent` | `u64` | Deposit in USDC equivalent |
| `original_amount` | `u64` | Original amount in deposit currency |
| `deposit_currency` | `u8` | 0 = USDC, 1 = IDRX |
| `deposited_at` | `i64` | Unix timestamp of deposit |
| `yield_claimed` | `u64` | Total RWA tokens claimed as yield |
| `bump` | `u8` | PDA bump seed |

---

## Error Codes

| Code | Name | Message |
|------|------|---------|
| 6000 | `BelowMinimum` | Deposit amount is below the vault minimum |
| 6001 | `LockupNotExpired` | Lockup period has not expired |
| 6002 | `ZeroAmount` | Amount must be greater than zero |
| 6003 | `Unauthorized` | Unauthorized |

---

## RWA Asset Vaults

The following vaults are configured matching the frontend:

| ID | Ticker | Asset | Total APY | Lockup | Min Deposit | Price |
|----|--------|-------|-----------|--------|-------------|-------|
| 1 | JAVA | Java Premium Coffee Estate | 14.2% | 30 days | $25 | $25 |
| 2 | SKYLN | Skyline Commercial Tower | 8.5% | 90 days | $100 | $100 |
| 3 | SGRID | Solar Grid Alpha | 11.0% | 60 days | $50 | $50 |
| 4 | BALI | Bali Resort Collection | 9.8% | 45 days | $75 | $75 |
| 5 | PALM | Palm Oil Yield Fund | 16.5% | 14 days | $10 | $10 |
| 6 | EVNET | EV Charging Network | 12.3% | 90 days | $40 | $40 |

---

## File Structure

```
mock_amm/
├── programs/
│   └── invest_apy/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs              # Core contract
├── tests/
│   └── invest_apy.ts              # Test suite (14 tests)
├── scripts/
│   └── setup_invest_apy.ts        # Devnet vault setup
└── Anchor.toml                    # Workspace config
```

---

## How to Build & Test

```bash
# Build both programs
cd mock_amm
anchor build

# Run tests (localnet — starts a local validator automatically)
# First switch Anchor.toml to cluster = "localnet"
anchor test

# All 14 tests should pass:
#   ✔ Initializes a vault for JAVA asset
#   ✔ Rejects deposit below minimum
#   ✔ User deposits 100 USDC
#   ✔ Fund RWA vault for yield distribution
#   ✔ Admin distributes yield in RWA tokens
#   ✔ Rejects withdrawal before lockup expires
#   ✔ User withdraws after lockup period
#   ✔ Updates vault APY rates
#   ✔ Updates IDRX rate
#   ✔ Updates RWA token price
#   ✔ User deposits IDRX (converted at currency rate)
```

## How to Deploy & Setup on Devnet

```bash
# 1. Switch Anchor.toml to devnet
#    cluster = "devnet"

# 2. Ensure wallet has SOL
solana airdrop 2

# 3. Deploy programs
anchor deploy

# 4. Run the setup script to create all 6 vaults
npx ts-node scripts/setup_invest_apy.ts

# This creates:
#   - RWA token mints for each asset
#   - Vault PDAs with APY configs
#   - Seeds each vault with 1M RWA tokens for yield
#   - Saves addresses to frontend/src/config/invest-apy-tokens.json
```

---

## Yield Calculation Example

For a **100 USDC** deposit in the **JAVA** vault (14.2% APY, $25/token):

```
Monthly USDC yield = 100 × 14.2% ÷ 12 = $1.1833
RWA tokens received = $1.1833 ÷ $25 = 0.047333 $JAVA
```

For an **IDRX deposit** (e.g., 500,000 IDRX at rate 15,625):

```
USDC equivalent = 500,000 ÷ 15,625 = $32.00
Monthly USDC yield = $32.00 × 14.2% ÷ 12 = $0.3787
RWA tokens received = $0.3787 ÷ $25 = 0.015147 $JAVA
```

---

## Frontend Integration

The IDL is available at `frontend/src/config/invest_apy.json` for Anchor client integration. Use the `useProgram` hook pattern to connect to the contract from React.

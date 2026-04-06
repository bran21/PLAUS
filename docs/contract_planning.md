# Anchor Smart Contracts Architecture

This document outlines the approach for developing the core Solana smart contracts for the RWAFi Protocol using the Anchor framework.

## Overview
We need to implement the base smart contracts to support real-world asset tokenization and USDC/IDRX investment. The goal is to create a robust, secure smart contract that handles Escrow Vaults, token minting, and liquidation.

## Anchor Project Structure
We will initialize a new Anchor project (using `anchor init contracts`) in the project root.

## Core Program Implementation (`lib.rs`)
The program will utilize `anchor-spl` to interact with standard token programs. We will implement three primary instruction handlers:

1. **`initialize_rwa`**:
   - **Purpose**: Allows an originator/admin to initialize a new RWA on-chain.
   - **Actions**: 
     - Creates a `RwaState` PDA.
     - Initializes an Escrow Token Account (PDA) specifically to receive USDC and IDRX.
     - Initializes the RWA Token Mint.

2. **`invest_funds`**:
   - **Purpose**: Allows an investor to deposit USDC or IDRX and receive fractional RWA tokens.
   - **Actions**:
     - Transfers USDC or IDRX from the user's wallet to the Escrow Token Account.
     - Mints RWA tokens to the user's token account proportionally to their invested amount.
   
3. **`liquidate_rwa`**:
   - **Purpose**: Allows an investor to burn their RWA tokens and claim back USDC or IDRX.
   - **Actions**:
     - Burns the specified amount of RWA tokens from the user's account.
     - Transfers the proportional USDC/IDRX from the Escrow Vault back to the user's wallet.

### Program State Account (`RwaState`)
- `admin_pubkey`: The authority managing the asset.
- `usdc_mint`: The base stablecoin used for settlement (USDC).
- `idrx_mint`: The base stablecoin used for settlement (IDRX).
- `rwa_mint`: The minted fractional asset.
- `escrow_vault`: The PDA holding the accumulated USDC and IDRX.
- `price_per_share`: Fixed scalar or oracle-fed price ratio.

## Testing Strategy
- We will construct comprehensive Mocha/Chai tests.
- Tests will include:
  1. Successful initialization of the state and vaults.
  2. Mocking user USDC and IDRX balances and successfully executing the `invest_funds` instruction.
  3. Validating that `liquidate_rwa` correctly burns tokens and transfers USDC/IDRX back.

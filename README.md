# Plaus Protocol

**Plaus Protocol** is a decentralized, KYC-free Solana Real World Asset (RWA) platform. It uses stablecoins (USDC and IDRX) as the base settlement layer, shifting fiat-to-crypto burdens to external edge partners, allowing global investors to acquire fractionalized, yield-bearing assets safely and instantly.

## Architecture & Repositories

The project is structured into three primary domains:

- **`/frontend`**: The user interface built with Next.js (App Router) and React. It features a sleek dark mode design, the primary investment dashboard, a secondary market swapping panel (TradePanel), and an AI Intent trading agent (Qwen/OpenAI integrated) that executes complex commands using natural language.
- **`/mock_amm`**: Contains the Rust-based Solana smart contracts using the Anchor framework. 
  - **`invest_apy` program**: Handles the creation of RWA token vaults, user stablecoin deposits, and yield execution.
  - **`mock_amm` program**: An automated market maker providing simulated secondary liquidity for the minted RWA tokens against USDC.
- **`/docs`**: Comprehensive documentation, including the roadmap, whitepaper, pitchdeck, and detailed contract schemas.

## Core Features

1. **Fractional RWA Investments**: Users can invest fractional amounts of USDC/IDRX into curated RWAs like `JAVA` (Coffee Harvest), `PALM` (Palm Oil Yield), or `BALI` (Real Estate SPVs).
2. **Secondary DEX Swapping**: Yield-bearing RWA tokens adhere to standard SPL token specifications, meaning users can swap them instantly via the built-in AMM to reclaim liquid USDC/IDRX without waiting for traditional lockups.
3. **AI Trading Assistant**: A built-in AI agent is capable of checking AMM reserves, routing swap paths, and crafting the base64 Anchor transactions on behalf of the user using intent-based natural language (e.g. *"Invest 50 USDC into JAVA"*).

## Local Development Setup

To run the full stack locally on Solana's Devnet configuration, follow these steps:

### 1. Smart Contracts
You need the Solana CLI, Rust, and Anchor installed.

```bash
cd mock_amm

# Install dependencies
yarn install

# Build the Anchor programs (ensure you have target/idl generated)
anchor build

# Sync the setup script to establish the token environments, deploy mock pools
# and seed Devnet tokens.
yarn run ts-node scripts/setup_invest_apy.ts
```

*Note: The `setup_invest_apy.ts` script automatically generates a `devnet-tokens.json` file inside `frontend/src/config/` for the web app to consume.*

### 2. Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
Navigate to `http://localhost:3000` to see the landing page, and `http://localhost:3000/app` to access the RWA dashboard.

## Requesting Test Funds (Devnet)
Once connected with Phantom on Devnet, simply click the **"Faucet"** button in the top right of the Investments page. The backend `/api/faucet` route will immediately dispense `10,000 USDC` and `150,000,000 IDRX` to your wallet to test deposits and liquidity provisioning.

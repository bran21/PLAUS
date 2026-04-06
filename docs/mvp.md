# MVP Scope & Specifications

## Core Concept
A fully decentralized platform allowing users to buy and sell fractionalized Real World Assets on the Solana blockchain using USDC and IDRX, and trade them on secondary third-party Decentralized Exchanges (DEXs).

## Phase 1 MVP Must-Haves
1.  **Smart Contracts (Anchor):**
    *   `initialize_rwa`: Creating the asset on-chain.
    *   `invest_funds`: Users deposit USDC or IDRX into the Escrow Vault and receive RWA tokens.
    *   `liquidate_rwa`: Users burn RWA tokens to claim back USDC or IDRX from the Vault.
2.  **Frontend (Next.js):**
    *   Wallet Connect integration (Phantom/Solflare).
    *   List view of available RWAs with price (in USDC/IDRX) and supply.
    *   Transaction builder UI allowing user to easily trigger the Solan smart contracts.
    *   **DEX Integration (Jupiter/Raydium):** Built-in widget for users to "Swap" RWA tokens for USDC/IDRX instantly or "Add Liquidity" (Provide RWA + USDC/IDRX to a pool to earn fees).
    *   **AI Agent (Conversational + Function Calling):** A chat interface powered by an LLM that lets users ask questions about the RWAs and automatically constructs action-level transactions (e.g., "Invest 50 USDC into the Java Farm RWA") via function calling, pending the user's wallet signature.
3.  **Data & Storage:**
    *   Off-chain metadata stored via decentralized storage (e.g., Arweave or IPFS) or local JSON for the MVP.
4.  **Secondary Market Mechanics:**
    *   Create standard SPL Tokens for the RWA asset, allowing seamless permissionless listing on third-party DEXs (Raydium, Orca).

## Future Roadmap
*   *Adding dynamic pricing oracles...*
*   *Governance mechanisms...*

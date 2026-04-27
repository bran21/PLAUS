np# Plaus Protocol Roadmap

This document outlines the current state of the Plaus Protocol development, tracking what has already been built for the MVP and what features are scheduled for upcoming milestones.

---

## ✅ Phase 1: MVP Foundation & Core Logic (Completed)

**Documentation & Architecture**
- [x] Defined MVP scope (`mvp.md`)
- [x] Drafted Plaus Protocol Whitepaper (`whitepaper.md`)
- [x] Created investor Pitchdeck (`pitchdeck.md`)
- [x] Finalized Smart Contract Architecture constraints

**Smart Contracts (Solana Anchor)**
- [x] Designed and deployed the `invest_apy` program (handles vault USDC deposits, yield generation, and user escrow management).
- [x] Built the `mock_amm` program (facilitates testing of USDC <-> RWA token pair swaps and liquidity provisioning).
- [x] Automated CLI scripts for minting mock RWA assets on localnet/devnet (`JAVA`, `PALM`, `BALI`, etc.).

**Frontend & Tokenization (Next.js)**
- [x] Developed seamless Landing Page, Navigation, and Dashboard layouts.
- [x] Integrated `@solana/wallet-adapter-react` for Phantom connection.
- [x] Built the `InvestPage` for fractional RWA asset discovery and APY visualization.
- [x] Created the `TradePanel` to interface with the AMM for asset liquidation and portfolio rebalancing.
- [x] Repaired UI/UX regressions (disabled disruptive Three.js canvas, fixed dark-theme contrast issues).

**AI Agent Integration (Qwen LLM)**
- [x] Built `AIAgent.tsx` component supporting three modes: Research, Investigate, and Transact.
- [x] Created secure `/api/agent` Next.js backend to securely proxy requests to the DashScope / Qwen API endpoints.
- [x] Context Injection: Agent reads real-time AMM program reserves to accurately calculate slippage and depth.
- [x] Transaction Execution: Agent dynamically maps user intent to Anchor RPC bindings (`depositUsdc`, `swap`, `addLiquidity`) and auto-generates Associated Token Accounts (ATAs).
- [x] Bugfixes: Corrected strict OpenAI-compatible schema role mapping (`agent` to `assistant`) for DashScope.

---

## 🚀 Phase 2: Mainnet Migration & Security (Next)

**Smart Contract Auditing**
- [ ] Prepare `invest_apy` and `mock_amm` for professional security audit (e.g., OtterSec, Neodyme).
- [ ] Finalize the administrative authorities and multi-sig implementations to protect protocol vaults.
- [ ] Upgrade mock Pyth network feeds to consume live Pyth mainnet price schedules.

**Network Transitions**
- [ ] Migrate `program_id` keys from Devnet sequences to Mainnet Beta.
- [ ] Establish initial liquidity pools on Raydium/Orca for the real RWA asset listings.

**Platform Expansion**
- [ ] Build standalone Asset Detail Pages for deeper due diligence on physical underlying assets (legal wrappers, PDFs).
- [ ] Implement Jupiter Aggregator (`@jup-ag/api`) routing for swaps rather than relying solely on the bespoke protocol AMM.

---

## 🔮 Phase 3: Advanced Automation & Scale (Future)

**AI Agent Enhancements**
- [ ] Implement conversational short/long-term memory using indexed browser storage.
- [ ] Proactive alerts: Sub-agents that continuously trace on-chain whale activity and push notifications to users.
- [ ] Complex multi-txn batching (e.g., harvesting yield from protocol A and automatically stacking it in protocol B).

**Cross-Chain Integration**
- [ ] Integrate Wormhole or CCTP to allow seamless USDC deposits directly from Ethereum/Arbitrum/Base.
- [ ] Implement social login abstractions (Privy or Web3Auth) so non-crypto-native institutional investors can onboard with an email.

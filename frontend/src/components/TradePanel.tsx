"use client";
import React, { useState, useEffect } from "react";
import styles from "./TradePanel.module.css";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useProgram } from "../hooks/useProgram";

interface Token {
  ticker: string;
  name: string;
  icon: string;
  address?: string;
  decimals: number;
}

interface SwapPair {
  id: string;
  tokenA: Token;
  tokenB: Token;
  reserveA: number;
  reserveB: number;
  fee: number; // percentage, e.g. 0.3
  volume24h: string;
  tvl: string;
}

const TOKENS: Record<string, Token> = {
  USDC: { ticker: "USDC", name: "USD Coin", icon: "💵", address: "4ayMQNSs3euPf153WisuS6cZvB6cbcjcat5vcGuBuC8d", decimals: 6 },
  IDRX: { ticker: "IDRX", name: "IDR Stablecoin", icon: "🇮🇩", address: "v15x8NaCm2teDnVu5M5dhdP5trV1D6YejF8m7a46ovF", decimals: 6 },
  CROP: { ticker: "CROP", name: "Cropify Token", icon: "🌾", address: "9pH2RaHXG82Ai4iiLKX6xM6rTmqrkbDpWQPfZWTKbVq4", decimals: 6 },
  JAVA: { ticker: "JAVA", name: "Java Coffee", icon: "☕", decimals: 6 },
  SKYLN: { ticker: "SKYLN", name: "Skyline Tower", icon: "🏙️", decimals: 6 },
  SGRID: { ticker: "SGRID", name: "Solar Grid", icon: "☀️", decimals: 6 },
  BALI: { ticker: "BALI", name: "Bali Resort", icon: "🏝️", decimals: 6 },
  PALM: { ticker: "PALM", name: "Palm Oil", icon: "🌴", decimals: 6 },
};

const SWAP_PAIRS: SwapPair[] = [
  { id: "CROP-USDC", tokenA: TOKENS.CROP, tokenB: TOKENS.USDC, reserveA: 0, reserveB: 0, fee: 0.3, volume24h: "$124.5K", tvl: "$1.2M" },
  { id: "IDRX-USDC", tokenA: TOKENS.IDRX, tokenB: TOKENS.USDC, reserveA: 0, reserveB: 0, fee: 0.3, volume24h: "$45.2K", tvl: "$500K" },
  { id: "JAVA-USDC", tokenA: TOKENS.JAVA, tokenB: TOKENS.USDC, reserveA: 5000, reserveB: 125000, fee: 0.3, volume24h: "$38.1K", tvl: "$250K" },
  { id: "JAVA-IDRX", tokenA: TOKENS.JAVA, tokenB: TOKENS.IDRX, reserveA: 2000, reserveB: 781250000, fee: 0.3, volume24h: "$12.8K", tvl: "$100K" },
  { id: "SKYLN-USDC", tokenA: TOKENS.SKYLN, tokenB: TOKENS.USDC, reserveA: 24000, reserveB: 2400000, fee: 0.3, volume24h: "$210.0K", tvl: "$4.8M" },
  { id: "SGRID-USDC", tokenA: TOKENS.SGRID, tokenB: TOKENS.USDC, reserveA: 17000, reserveB: 850000, fee: 0.3, volume24h: "$67.3K", tvl: "$1.7M" },
  { id: "BALI-USDC", tokenA: TOKENS.BALI, tokenB: TOKENS.USDC, reserveA: 10000, reserveB: 750000, fee: 0.3, volume24h: "$92.4K", tvl: "$1.5M" },
  { id: "PALM-USDC", tokenA: TOKENS.PALM, tokenB: TOKENS.USDC, reserveA: 100000, reserveB: 1000000, fee: 0.3, volume24h: "$156.7K", tvl: "$2.0M" },
  { id: "PALM-IDRX", tokenA: TOKENS.PALM, tokenB: TOKENS.IDRX, reserveA: 50000, reserveB: 7812500000, fee: 0.3, volume24h: "$28.9K", tvl: "$625K" },
];

type Tab = "swap" | "liquidity";

function computeSwapOutput(amountIn: number, reserveIn: number, reserveOut: number, feePct: number): number {
  if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) return 0;
  const amountInAfterFee = amountIn * (1 - feePct / 100);
  return (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee);
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(6);
}

export default function TradePanel() {
  const { wallet, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const program = useProgram();

  const [pairs, setPairs] = useState<SwapPair[]>(SWAP_PAIRS);
  const [tab, setTab] = useState<Tab>("swap");
  const [selectedPair, setSelectedPair] = useState<SwapPair>(pairs[0]);
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [direction, setDirection] = useState<"AtoB" | "BtoA">("BtoA"); // default: pay stablecoin, receive RWA
  const [fromAmount, setFromAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Liquidity
  const [lpAmountA, setLpAmountA] = useState("");
  const [lpAmountB, setLpAmountB] = useState("");

  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchBalances() {
      if (!publicKey) {
        setBalances({});
        return;
      }
      const newBalances: Record<string, number> = {};
      const tokensToCheck = [selectedPair.tokenA, selectedPair.tokenB];
      for (const token of tokensToCheck) {
        if (token.address) {
          try {
            const mint = new PublicKey(token.address);
            const ata = await getAssociatedTokenAddress(mint, publicKey);
            const account = await getAccount(connection, ata);
            newBalances[token.ticker] = Number(account.amount) / Math.pow(10, token.decimals);
          } catch (e) {
            newBalances[token.ticker] = 0;
          }
        } else {
          newBalances[token.ticker] = 0;
        }
      }
      setBalances(newBalances);
    }
    fetchBalances();
  }, [publicKey, connection, selectedPair]);

  const fromToken = direction === "AtoB" ? selectedPair.tokenA : selectedPair.tokenB;
  const toToken = direction === "AtoB" ? selectedPair.tokenB : selectedPair.tokenA;

  const reserveFrom = direction === "AtoB" ? selectedPair.reserveA : selectedPair.reserveB;
  const reserveTo = direction === "AtoB" ? selectedPair.reserveB : selectedPair.reserveA;

  const computedOutput =
    fromAmount && parseFloat(fromAmount) > 0
      ? computeSwapOutput(parseFloat(fromAmount), reserveFrom, reserveTo, selectedPair.fee)
      : 0;

  const priceImpact =
    fromAmount && parseFloat(fromAmount) > 0
      ? ((parseFloat(fromAmount) / (reserveFrom + parseFloat(fromAmount))) * 100).toFixed(2)
      : "0.00";

  const spotRate = reserveFrom > 0 ? reserveTo / reserveFrom : 0;

  const filteredPairs = SWAP_PAIRS.filter((p) =>
    searchQuery === "" ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tokenA.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tokenB.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFlipDirection = () => {
    setDirection(direction === "AtoB" ? "BtoA" : "AtoB");
    setFromAmount("");
  };

  const handleSelectPair = (pair: SwapPair) => {
    setSelectedPair(pair);
    setIsPairDropdownOpen(false);
    setFromAmount("");
    setSearchQuery("");
    const isStableA = pair.tokenA.ticker === "USDC" || pair.tokenA.ticker === "IDRX";
    setDirection(isStableA ? "AtoB" : "BtoA");
  };

  useEffect(() => {
    async function loadReserves() {
      if (!program) return;
      const updatedPairs = await Promise.all(SWAP_PAIRS.map(async (pair) => {
        if (!pair.tokenA.address || !pair.tokenB.address) return pair;
        try {
          const mintA = new PublicKey(pair.tokenA.address);
          const mintB = new PublicKey(pair.tokenB.address);
          const [poolPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("pool"), mintA.toBuffer(), mintB.toBuffer()],
            program.programId
          );
          // @ts-expect-error — Anchor IDL types not fully resolved at compile time
          const poolData = await program.account.pool.fetch(poolPda);
          return {
            ...pair,
            reserveA: poolData.reserveA.toNumber() / 1_000_000,
            reserveB: poolData.reserveB.toNumber() / 1_000_000,
          };
        } catch (e) {
          console.error("Failed to load pool for", pair.id, e);
          return pair;
        }
      }));
      setPairs(updatedPairs);
      // Update selected pair if it's already set
      setSelectedPair(current => updatedPairs.find(p => p.id === current.id) || current);
    }
    loadReserves();
  }, [program]);

  const handleSwap = async () => {
    if (!program || !publicKey || !selectedPair.tokenA.address || !selectedPair.tokenB.address) {
      alert("Please connect wallet and select valid pair");
      return;
    }
    
    try {
      const mintA = new PublicKey(selectedPair.tokenA.address);
      const mintB = new PublicKey(selectedPair.tokenB.address);
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), mintA.toBuffer(), mintB.toBuffer()],
        program.programId
      );
      const [vaultA] = PublicKey.findProgramAddressSync([Buffer.from("vault_a"), poolPda.toBuffer()], program.programId);
      const [vaultB] = PublicKey.findProgramAddressSync([Buffer.from("vault_b"), poolPda.toBuffer()], program.programId);

      // We need ATAs for the user
      // For simplicity, we assume they exist as they were created by the setup script
      // In a real app we'd get them or create instructions to create them if they don't exist
      const userTokenA = anchor.utils.token.associatedAddress({ mint: mintA, owner: publicKey });
      const userTokenB = anchor.utils.token.associatedAddress({ mint: mintB, owner: publicKey });

      const amountInBase = new anchor.BN(parseFloat(fromAmount) * 1_000_000);
      const isAtoB = direction === "AtoB";

      await program.methods
        .swap(amountInBase, isAtoB)
        .accounts({
          pool: poolPda,
          user: publicKey,
          userIn: isAtoB ? userTokenA : userTokenB,
          userOut: isAtoB ? userTokenB : userTokenA,
          vaultA: vaultA,
          vaultB: vaultB,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert("Swap successful!");
      setFromAmount("");
    } catch (e) {
      console.error(e);
      alert("Swap failed");
    }
  };

  const handleLiquidity = async () => {
    if (!program || !publicKey || !selectedPair.tokenA.address || !selectedPair.tokenB.address) {
      alert("Please connect wallet and select valid pair");
      return;
    }

    try {
      const mintA = new PublicKey(selectedPair.tokenA.address);
      const mintB = new PublicKey(selectedPair.tokenB.address);
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), mintA.toBuffer(), mintB.toBuffer()],
        program.programId
      );
      const [vaultA] = PublicKey.findProgramAddressSync([Buffer.from("vault_a"), poolPda.toBuffer()], program.programId);
      const [vaultB] = PublicKey.findProgramAddressSync([Buffer.from("vault_b"), poolPda.toBuffer()], program.programId);

      const userTokenA = anchor.utils.token.associatedAddress({ mint: mintA, owner: publicKey });
      const userTokenB = anchor.utils.token.associatedAddress({ mint: mintB, owner: publicKey });

      const amountABase = new anchor.BN(parseFloat(lpAmountA) * 1_000_000);
      const amountBBase = new anchor.BN(parseFloat(lpAmountB) * 1_000_000);

      await program.methods
        .addLiquidity(amountABase, amountBBase)
        .accounts({
          pool: poolPda,
          user: publicKey,
          userA: userTokenA,
          userB: userTokenB,
          vaultA: vaultA,
          vaultB: vaultB,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert("Liquidity added successfully!");
      setLpAmountA("");
      setLpAmountB("");
    } catch (e) {
      console.error(e);
      alert("Failed to add liquidity");
    }
  };

  return (
    <section className={styles.section} id="trade">
      <div className="container">
        <div className={styles.layout}>
          {/* Left: Pair list + info */}
          <div className={styles.info}>
            <h2 className={styles.sectionTitle}>Swap</h2>
            <p className={styles.sectionSub}>
              Trade RWA tokens instantly through the on-chain AMM.
              All pairs settle via constant-product pools on Solana.
            </p>

            {/* Available Pairs list */}
            <div className={styles.pairListHeader}>
              <span className={styles.pairListTitle}>Available Pairs</span>
              <span className={styles.pairCount}>{SWAP_PAIRS.length} pools</span>
            </div>
            <div className={styles.pairList}>
              {pairs.map((pair) => (
                <button
                  key={pair.id}
                  className={`${styles.pairItem} ${selectedPair.id === pair.id ? styles.pairItemActive : ""}`}
                  onClick={() => handleSelectPair(pair)}
                  id={`pair-${pair.id.toLowerCase()}`}
                >
                  <div className={styles.pairIcons}>
                    <span className={styles.pairIcon}>{pair.tokenA.icon}</span>
                    <span className={styles.pairIconOverlap}>{pair.tokenB.icon}</span>
                  </div>
                  <div className={styles.pairInfo}>
                    <span className={styles.pairName}>
                      {pair.tokenA.ticker}/{pair.tokenB.ticker}
                    </span>
                    <span className={styles.pairMeta}>
                      TVL {pair.tvl}
                    </span>
                  </div>
                  <div className={styles.pairRight}>
                    <span className={styles.pairVol}>{pair.volume24h}</span>
                    <span className={styles.pairFee}>{pair.fee}% fee</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Swap Panel */}
          <div className={`glass-elevated ${styles.panel}`}>
            {/* Tab Header */}
            <div className={styles.tabBar}>
              <button
                className={`${styles.tab} ${tab === "swap" ? styles.tabActive : ""}`}
                onClick={() => setTab("swap")}
                id="tab-swap"
              >
                Swap
              </button>
              <button
                className={`${styles.tab} ${tab === "liquidity" ? styles.tabActive : ""}`}
                onClick={() => setTab("liquidity")}
                id="tab-liquidity"
              >
                Add Liquidity
              </button>
            </div>

            {tab === "swap" ? (
              <div className={styles.panelBody}>
                {/* Pair Selector */}
                <div className={styles.pairSelector}>
                  <button
                    className={styles.pairSelectBtn}
                    onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
                    id="pair-select-btn"
                  >
                    <div className={styles.pairSelectIcons}>
                      <span>{selectedPair.tokenA.icon}</span>
                      <span className={styles.pairSelectOverlap}>{selectedPair.tokenB.icon}</span>
                    </div>
                    <span className={styles.pairSelectLabel}>
                      {selectedPair.tokenA.ticker}/{selectedPair.tokenB.ticker}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {isPairDropdownOpen && (
                    <div className={styles.pairDropdown}>
                      <div className={styles.pairDropdownSearch}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search pairs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={styles.pairSearchInput}
                          autoFocus
                        />
                      </div>
                      <div className={styles.pairDropdownList}>
                        {filteredPairs.map((pair) => (
                          <button
                            key={pair.id}
                            className={`${styles.pairDropdownItem} ${selectedPair.id === pair.id ? styles.pairDropdownItemActive : ""}`}
                            onClick={() => handleSelectPair(pair)}
                          >
                            <div className={styles.pairDropdownIcons}>
                              <span>{pair.tokenA.icon}</span>
                              <span className={styles.pairDropdownOverlap}>{pair.tokenB.icon}</span>
                            </div>
                            <div className={styles.pairDropdownInfo}>
                              <strong>{pair.tokenA.ticker}/{pair.tokenB.ticker}</strong>
                              <span>TVL {pair.tvl} · Vol {pair.volume24h}</span>
                            </div>
                          </button>
                        ))}
                        {filteredPairs.length === 0 && (
                          <div className={styles.pairDropdownEmpty}>No pairs found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* From */}
                <div className={styles.swapBox}>
                  <div className={styles.swapRow}>
                    <span className={styles.swapLabel}>You Pay</span>
                    <span className={styles.swapBalance}>Balance: {balances[fromToken.ticker] !== undefined ? formatNumber(balances[fromToken.ticker]) : "—"}</span>
                  </div>
                  <div className={styles.swapInputRow}>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className={styles.swapInput}
                      id="swap-from-input"
                    />
                    <div className={styles.tokenPill}>
                      <span className={styles.tokenIcon}>{fromToken.icon}</span>
                      {fromToken.ticker}
                    </div>
                  </div>
                </div>

                {/* Divider with flip */}
                <div className={styles.divider}>
                  <button className={styles.swapArrow} onClick={handleFlipDirection} id="swap-direction-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>

                {/* To */}
                <div className={styles.swapBox}>
                  <div className={styles.swapRow}>
                    <span className={styles.swapLabel}>You Receive</span>
                    <span className={styles.swapBalance}>Balance: {balances[toToken.ticker] !== undefined ? formatNumber(balances[toToken.ticker]) : "—"}</span>
                  </div>
                  <div className={styles.swapInputRow}>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={computedOutput > 0 ? formatNumber(computedOutput) : ""}
                      readOnly
                      className={styles.swapInput}
                      id="swap-to-input"
                    />
                    <div className={styles.tokenPill}>
                      <span className={styles.tokenIcon}>{toToken.icon}</span>
                      {toToken.ticker}
                    </div>
                  </div>
                </div>

                {/* Swap Details */}
                <div className={styles.swapDetails}>
                  <div className={styles.detailRow}>
                    <span>Rate</span>
                    <span>1 {fromToken.ticker} ≈ {formatNumber(spotRate)} {toToken.ticker}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Price Impact</span>
                    <span className={parseFloat(priceImpact) > 5 ? styles.highImpact : ""}>
                      {priceImpact}%
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Swap Fee</span>
                    <span>{selectedPair.fee}%</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Pool Liquidity</span>
                    <span>{formatNumber(reserveFrom)} {fromToken.ticker} / {formatNumber(reserveTo)} {toToken.ticker}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg btn-full"
                  id="swap-execute-btn"
                  disabled={!fromAmount || parseFloat(fromAmount) <= 0}
                  onClick={handleSwap}
                >
                  {fromAmount && parseFloat(fromAmount) > 0
                    ? `Swap for ${formatNumber(computedOutput)} ${toToken.ticker}`
                    : "Enter amount"}
                </button>
              </div>
            ) : (
              /* Liquidity Tab */
              <div className={styles.panelBody}>
                {/* Pair Selector (same) */}
                <div className={styles.pairSelector}>
                  <button
                    className={styles.pairSelectBtn}
                    onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
                    id="lp-pair-select-btn"
                  >
                    <div className={styles.pairSelectIcons}>
                      <span>{selectedPair.tokenA.icon}</span>
                      <span className={styles.pairSelectOverlap}>{selectedPair.tokenB.icon}</span>
                    </div>
                    <span className={styles.pairSelectLabel}>
                      {selectedPair.tokenA.ticker}/{selectedPair.tokenB.ticker}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {isPairDropdownOpen && (
                    <div className={styles.pairDropdown}>
                      <div className={styles.pairDropdownSearch}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search pairs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className={styles.pairSearchInput}
                          autoFocus
                        />
                      </div>
                      <div className={styles.pairDropdownList}>
                        {filteredPairs.map((pair) => (
                          <button
                            key={pair.id}
                            className={`${styles.pairDropdownItem} ${selectedPair.id === pair.id ? styles.pairDropdownItemActive : ""}`}
                            onClick={() => handleSelectPair(pair)}
                          >
                            <div className={styles.pairDropdownIcons}>
                              <span>{pair.tokenA.icon}</span>
                              <span className={styles.pairDropdownOverlap}>{pair.tokenB.icon}</span>
                            </div>
                            <div className={styles.pairDropdownInfo}>
                              <strong>{pair.tokenA.ticker}/{pair.tokenB.ticker}</strong>
                              <span>TVL {pair.tvl}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.swapBox}>
                  <div className={styles.swapRow}>
                    <span className={styles.swapLabel}>{selectedPair.tokenA.ticker} Amount</span>
                    <span className={styles.swapBalance}>Balance: {balances[selectedPair.tokenA.ticker] !== undefined ? formatNumber(balances[selectedPair.tokenA.ticker]) : "—"}</span>
                  </div>
                  <div className={styles.swapInputRow}>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={lpAmountA}
                      onChange={(e) => {
                        setLpAmountA(e.target.value);
                        if (e.target.value && parseFloat(e.target.value) > 0) {
                          const ratio = selectedPair.reserveB / selectedPair.reserveA;
                          setLpAmountB((parseFloat(e.target.value) * ratio).toFixed(4));
                        } else {
                          setLpAmountB("");
                        }
                      }}
                      className={styles.swapInput}
                      id="lp-amount-a-input"
                    />
                    <div className={styles.tokenPill}>
                      <span className={styles.tokenIcon}>{selectedPair.tokenA.icon}</span>
                      {selectedPair.tokenA.ticker}
                    </div>
                  </div>
                </div>

                <div className={styles.plusSign}>+</div>

                <div className={styles.swapBox}>
                  <div className={styles.swapRow}>
                    <span className={styles.swapLabel}>{selectedPair.tokenB.ticker} Amount</span>
                    <span className={styles.swapBalance}>Balance: {balances[selectedPair.tokenB.ticker] !== undefined ? formatNumber(balances[selectedPair.tokenB.ticker]) : "—"}</span>
                  </div>
                  <div className={styles.swapInputRow}>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={lpAmountB}
                      onChange={(e) => setLpAmountB(e.target.value)}
                      className={styles.swapInput}
                      id="lp-amount-b-input"
                    />
                    <div className={styles.tokenPill}>
                      <span className={styles.tokenIcon}>{selectedPair.tokenB.icon}</span>
                      {selectedPair.tokenB.ticker}
                    </div>
                  </div>
                </div>

                <div className={styles.swapDetails}>
                  <div className={styles.detailRow}>
                    <span>Pool</span>
                    <span>{selectedPair.tokenA.ticker}/{selectedPair.tokenB.ticker}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Current Ratio</span>
                    <span>1 {selectedPair.tokenA.ticker} = {formatNumber(selectedPair.reserveB / selectedPair.reserveA)} {selectedPair.tokenB.ticker}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Pool TVL</span>
                    <span>{selectedPair.tvl}</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg btn-full"
                  id="add-liquidity-btn"
                  disabled={!lpAmountA || parseFloat(lpAmountA) <= 0}
                  onClick={handleLiquidity}
                >
                  {lpAmountA && parseFloat(lpAmountA) > 0
                    ? "Add Liquidity"
                    : "Enter amounts"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

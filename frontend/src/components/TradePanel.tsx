"use client";
import React, { useState } from "react";
import styles from "./TradePanel.module.css";

type Tab = "swap" | "liquidity";

const RWA_TOKENS = [
  { ticker: "CROP", name: "Cropify Token", price: 5, address: "BEsztBGwPpgmfnsT5jBJeNRizx1FzLurPyDVD4X5vtj5" },
  { ticker: "JAVA", name: "Java Coffee", price: 25 },
  { ticker: "SKYLN", name: "Skyline Tower", price: 100 },
  { ticker: "SGRID", name: "Solar Grid", price: 50 },
  { ticker: "BALI", name: "Bali Resort", price: 75 },
  { ticker: "PALM", name: "Palm Oil", price: 10 },
];

const BASE_TOKENS = [
  { ticker: "USDC", name: "USD Coin", address: "GZuZXotcWT9aCSACWs8WWbXH2czVRDh9riPtWL7MRK5a", price: 1 },
  { ticker: "IDRX", name: "IDR Stablecoin", address: "2DyHbi9PxPngSgnqLAADbArK65cF5sVwccAwAHhgsqMD", price: 0.000064 },
];

export default function TradePanel() {
  const [tab, setTab] = useState<Tab>("swap");
  const [fromAmount, setFromAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(RWA_TOKENS[0]);
  const [isTokenSelect, setIsTokenSelect] = useState(false);

  // Liquidity
  const [lpUsdc, setLpUsdc] = useState("");
  const [lpToken, setLpToken] = useState("");

  const computedTo =
    fromAmount && parseFloat(fromAmount) > 0
      ? (parseFloat(fromAmount) / selectedToken.price).toFixed(4)
      : "";

  const computedLpToken =
    lpUsdc && parseFloat(lpUsdc) > 0
      ? (parseFloat(lpUsdc) / selectedToken.price).toFixed(4)
      : "";

  return (
    <section className={styles.section} id="trade">
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.info}>
            <h2 className={styles.sectionTitle}>Secondary Market</h2>
            <p className={styles.sectionSub}>
              Swap RWA tokens instantly or provide liquidity to earn trading fees.
              All trades settle through integrated DEX aggregators on Solana.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Instant Swaps</h4>
                  <p className={styles.featureDesc}>Trade RWA tokens for USDC/IDRX through Jupiter/Raydium - sub-second finality.</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Provide Liquidity</h4>
                  <p className={styles.featureDesc}>Earn trading fees by providing RWA + USDC/IDRX to AMM liquidity pools.</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
                  </svg>
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Permissionless</h4>
                  <p className={styles.featureDesc}>No KYC. No geo-restrictions. Connect wallet and trade freely.</p>
                </div>
              </div>
            </div>
          </div>

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
                {/* From */}
                <div className={styles.swapBox}>
                  <div className={styles.swapRow}>
                    <span className={styles.swapLabel}>You Pay</span>
                    <span className={styles.swapBalance}>Balance: 1,450.00</span>
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
                      <span className={styles.tokenDot} style={{ background: "#2775ca" }} />
                      USDC / IDRX
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className={styles.divider}>
                  <button className={styles.swapArrow} id="swap-direction-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                  </button>
                </div>

                {/* To */}
                <div className={styles.swapBox}>
                  <div className={styles.swapRow}>
                    <span className={styles.swapLabel}>You Receive</span>
                    <span className={styles.swapBalance}>Balance: 0.00</span>
                  </div>
                  <div className={styles.swapInputRow}>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={computedTo}
                      readOnly
                      className={styles.swapInput}
                      id="swap-to-input"
                    />
                    <button
                      className={styles.tokenPill}
                      onClick={() => setIsTokenSelect(!isTokenSelect)}
                      id="token-select-btn"
                    >
                      <span className={styles.tokenDot} style={{ background: "var(--accent)" }} />
                      {selectedToken.ticker}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                  </div>

                  {isTokenSelect && (
                    <div className={styles.tokenDropdown}>
                      {RWA_TOKENS.map((t) => (
                        <button
                          key={t.ticker}
                          className={styles.tokenOption}
                          onClick={() => {
                            setSelectedToken(t);
                            setIsTokenSelect(false);
                          }}
                        >
                          <span className={styles.tokenDot} style={{ background: "var(--accent)" }} />
                          <div>
                            <strong>{t.ticker}</strong>
                            <span>{t.name}</span>
                          </div>
                          <span className={styles.tokenPrice}>${t.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.rateRow}>
                  <span>Rate</span>
                  <span>1 {selectedToken.ticker} = ${selectedToken.price} equivalent</span>
                </div>

                <button 
                  className="btn btn-primary btn-lg btn-full" 
                  id="swap-execute-btn"
                  onClick={() => alert(`Successfully swapped ${fromAmount} USDC/IDRX for ${computedTo} ${selectedToken.ticker}!`)}
                >
                  {fromAmount && parseFloat(fromAmount) > 0
                    ? `Swap for ${computedTo} ${selectedToken.ticker}`
                    : "Enter amount"}
                </button>
              </div>
            ) : (
              <div className={styles.panelBody}>
                <div className={styles.swapBox}>
                  <div className={styles.swapRow}>
                    <span className={styles.swapLabel}>USDC / IDRX Amount</span>
                  </div>
                  <div className={styles.swapInputRow}>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={lpUsdc}
                      onChange={(e) => {
                        setLpUsdc(e.target.value);
                        if (e.target.value) {
                          setLpToken(
                            (parseFloat(e.target.value) / selectedToken.price).toFixed(4)
                          );
                        } else {
                          setLpToken("");
                        }
                      }}
                      className={styles.swapInput}
                      id="lp-usdc-input"
                    />
                    <div className={styles.tokenPill}>
                      <span className={styles.tokenDot} style={{ background: "#2775ca" }} />
                      USDC / IDRX
                    </div>
                  </div>
                </div>

                <div className={styles.plusSign}>+</div>

                <div className={styles.swapBox}>
                  <div className={styles.swapRow}>
                    <span className={styles.swapLabel}>{selectedToken.ticker} Amount</span>
                  </div>
                  <div className={styles.swapInputRow}>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={lpToken}
                      onChange={(e) => setLpToken(e.target.value)}
                      className={styles.swapInput}
                      id="lp-token-input"
                    />
                    <button
                      className={styles.tokenPill}
                      onClick={() => setIsTokenSelect(!isTokenSelect)}
                      id="lp-token-select-btn"
                    >
                      <span className={styles.tokenDot} style={{ background: "var(--accent)" }} />
                      {selectedToken.ticker}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                  </div>

                  {isTokenSelect && (
                    <div className={styles.tokenDropdown}>
                      {RWA_TOKENS.map((t) => (
                        <button
                          key={t.ticker}
                          className={styles.tokenOption}
                          onClick={() => {
                            setSelectedToken(t);
                            setIsTokenSelect(false);
                          }}
                        >
                          <span className={styles.tokenDot} style={{ background: "var(--accent)" }} />
                          <div>
                            <strong>{t.ticker}</strong>
                            <span>{t.name}</span>
                          </div>
                          <span className={styles.tokenPrice}>${t.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.rateRow}>
                  <span>Pool Pair</span>
                  <span>{selectedToken.ticker} / USDC or IDRX</span>
                </div>

                <button 
                  className="btn btn-primary btn-lg btn-full" 
                  id="add-liquidity-btn"
                  onClick={() => alert(`Successfully added ${lpUsdc} USDC/IDRX and ${lpToken} ${selectedToken.ticker} to liquidity pool!`)}
                >
                  {lpUsdc && parseFloat(lpUsdc) > 0
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

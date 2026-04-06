"use client";
import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import styles from "./Portfolio.module.css";

const MOCK_HOLDINGS = [
  { ticker: "CROP", name: "Cropify Token", amount: "1,000,000", value: "$5,000,000", apy: "12.5%", change: "+$150.00", address: "BEsztBGwPpgmfnsT5jBJeNRizx1FzLurPyDVD4X5vtj5" },
  { ticker: "USDC", name: "USD Coin Mock", amount: "1,000,000", value: "$1,000,000", apy: "5.0%", change: "+$50.00", address: "GZuZXotcWT9aCSACWs8WWbXH2czVRDh9riPtWL7MRK5a" },
  { ticker: "IDRX", name: "IDR Stablecoin Mock", amount: "100,000,000", value: "$6,250", apy: "7.0%", change: "+$5.50", address: "2DyHbi9PxPngSgnqLAADbArK65cF5sVwccAwAHhgsqMD" },
  { ticker: "JAVA", name: "Java Coffee Estate", amount: "4.00", value: "$100.00", apy: "14.2%", change: "+$3.20" },
  { ticker: "PALM", name: "Palm Oil Yield Fund", amount: "10.00", value: "$100.00", apy: "16.5%", change: "+$5.10" },
];

export default function Portfolio() {
  const { connected } = useWallet();

  return (
    <section className={styles.section} id="portfolio">
      <div className="container">
        <h2 className={styles.sectionTitle}>Your Portfolio</h2>
        <p className={styles.sectionSub}>
          Track your fractionalized RWA holdings and accumulated yield.
        </p>

        {connected ? (
          <div className={styles.content}>
            {/* Summary Cards */}
            <div className={styles.summaryRow}>
              <div className={`glass ${styles.summaryCard}`}>
                <span className={styles.summaryLabel}>Total Value</span>
                <span className={styles.summaryValue}>$200.00</span>
              </div>
              <div className={`glass ${styles.summaryCard}`}>
                <span className={styles.summaryLabel}>Unrealized Yield</span>
                <span className={`${styles.summaryValue} ${styles.yieldVal}`}>+$8.30</span>
              </div>
              <div className={`glass ${styles.summaryCard}`}>
                <span className={styles.summaryLabel}>Assets Held</span>
                <span className={styles.summaryValue}>2</span>
              </div>
            </div>

            {/* Holdings Table */}
            <div className={`glass-elevated ${styles.table}`}>
              <div className={styles.tableHeader}>
                <span>Asset</span>
                <span>Amount</span>
                <span>Value</span>
                <span>APY</span>
                <span>P&L</span>
                <span></span>
              </div>
              {MOCK_HOLDINGS.map((h) => (
                <div className={styles.tableRow} key={h.ticker}>
                  <div className={styles.assetCell}>
                    <span className={styles.assetTicker}>${h.ticker}</span>
                    <span className={styles.assetName}>{h.name}</span>
                  </div>
                  <span>{h.amount}</span>
                  <span>{h.value}</span>
                  <span className={styles.yieldVal}>{h.apy}</span>
                  <span className={styles.yieldVal}>{h.change}</span>
                  <button className="btn btn-secondary btn-sm" id={`liquidate-${h.ticker.toLowerCase()}-btn`}>
                    Liquidate
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`glass ${styles.empty}`}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="6" width="20" height="12" rx="2"/>
                <path d="M2 10h20"/>
                <path d="M6 14h4"/>
              </svg>
            </div>
            <h3>Connect Your Wallet</h3>
            <p>Connect a Solana wallet to view your RWA portfolio and manage investments.</p>
          </div>
        )}
      </div>
    </section>
  );
}

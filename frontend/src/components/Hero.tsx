"use client";
import React from "react";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <span className="pulse-dot" />
            <span>Live on Solana Devnet</span>
          </div>
          <h1 className={styles.title}>
            Fractional <span className="text-accent-gradient">Real World Assets</span>
            <br />on Solana DeFi
          </h1>
          <p className={styles.subtitle}>
            Invest in tokenized real estate, agriculture, and infrastructure using USDC and IDRX.
            Trade on secondary DEXs. Let AI execute your investment intents — all permissionless.
          </p>
          <div className={styles.actions}>
            <a href="#markets" className="btn btn-primary btn-lg" id="hero-explore-btn">
              Explore Markets
            </a>
            <a href="#trade" className="btn btn-secondary btn-lg" id="hero-trade-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              Start Trading
            </a>
          </div>
        </div>

        <div className={styles.statsRow}>
          <StatCard label="Total Value Locked" value="$3.37M" change="+12.4%" />
          <StatCard label="Active Markets" value="6" change="3 new" />
          <StatCard label="Avg. APY" value="11.2%" change="+0.8%" />
          <StatCard label="Total Investors" value="1,284" change="+156" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: string; }) {
  return (
    <div className={`glass ${styles.stat}`}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statChange}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 15l-6-6-6 6" />
        </svg>
        {change}
      </span>
    </div>
  );
}

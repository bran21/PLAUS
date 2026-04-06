"use client";
import React from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.mainRow}>
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
              <Link href="/app#markets" className="btn btn-primary btn-lg" id="hero-explore-btn">
                Explore Markets
              </Link>
              <Link href="/app#trade" className="btn btn-secondary btn-lg" id="hero-trade-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                  <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
                Start Trading
              </Link>
            </div>
          </div>

          <div className={styles.visual}>
            <div className={styles.visualCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardBadge}>Active Yield</div>
                <div className={styles.cardPrice}>$2,500.00</div>
              </div>
              <div className={styles.cardChart}>
                <svg width="100%" height="60" viewBox="0 0 200 60">
                  <path d="M0 50 Q 25 45, 50 35 T 100 30 T 150 20 T 200 10" stroke="var(--accent)" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <div className={styles.cardFooter}>
                <span>Market: Ubud Eco-Resort</span>
                <span className={styles.cardTrend}>+12.4%</span>
              </div>
            </div>
            <div className={`${styles.visualCard} ${styles.cardSecondary}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardBadge} style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--blue)' }}>Asset Pool</div>
                <div className={styles.cardPrice}>$1.2M</div>
              </div>
              <div className={styles.cardFooter}>
                <span>Corn Harvest #04</span>
                <span className={styles.cardTrend}>Stable</span>
              </div>
            </div>
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

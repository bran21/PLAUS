"use client";
import React from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} id="hero">
      {/* Animated mesh gradient background */}
      <div className={styles.meshGradient} aria-hidden="true" />
      <div className={styles.meshOrb1} aria-hidden="true" />
      <div className={styles.meshOrb2} aria-hidden="true" />
      <div className={styles.meshOrb3} aria-hidden="true" />

      {/* Geometric grid lines */}
      <div className={styles.gridLines} aria-hidden="true">
        <div className={styles.gridLineH} style={{ top: '25%' }} />
        <div className={styles.gridLineH} style={{ top: '50%' }} />
        <div className={styles.gridLineH} style={{ top: '75%' }} />
        <div className={styles.gridLineV} style={{ left: '20%' }} />
        <div className={styles.gridLineV} style={{ left: '40%' }} />
        <div className={styles.gridLineV} style={{ left: '60%' }} />
        <div className={styles.gridLineV} style={{ left: '80%' }} />
      </div>

      {/* Content */}
      <div className={styles.contentLayer}>
        <div className={styles.eyebrow}>
          <span className="pulse-dot" />
          <span>Live on Solana Devnet</span>
        </div>

        <h1 className={styles.title}>
          <span className={styles.titleLine}>
            <span className={styles.titleWord} style={{ animationDelay: "0s" }}>
              Institutional-Grade
            </span>
          </span>
          <span className={styles.titleLine}>
            <span
              className={`${styles.titleWord} ${styles.titleAccent}`}
              style={{ animationDelay: "0.1s" }}
            >
              Real World Assets
            </span>
          </span>
          <span className={styles.titleLine}>
            <span className={styles.titleWord} style={{ animationDelay: "0.2s" }}>
              on Solana
            </span>
          </span>
        </h1>

        <p className={styles.subtitle}>
          Invest in tokenized real estate, agriculture, and infrastructure.
          <br />
          Trade permissionlessly. Let AI execute your intents.
        </p>

        <div className={styles.actions}>
          <Link href="/app#markets" className={`btn btn-primary btn-lg ${styles.ctaPrimary}`} id="hero-explore-btn">
            <span>Explore Markets</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/app#trade" className={`btn btn-secondary btn-lg ${styles.ctaSecondary}`} id="hero-trade-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>Start Trading</span>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className={styles.trustRow}>
          <div className={styles.trustItem}>
            <img src="/solana.png" alt="Solana" width="20" height="20" style={{ borderRadius: '50%' }} />
            <span>Powered by Solana</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Non-Custodial</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Instant Settlement</span>
          </div>
        </div>
      </div>

      {/* Floating stats — pinned to bottom */}
      <div className={styles.statsLayer}>
        <div className={styles.statsRow}>
          <StatCard label="Total Value Locked" value="$3.37M" change="+12.4%" />
          <StatCard label="Active Markets" value="6" change="3 new" />
          <StatCard label="Avg. APY" value="11.2%" change="+0.8%" />
          <StatCard label="Total Investors" value="1,284" change="+156" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <span>Scroll</span>
        <svg className={styles.scrollChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statChange}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M18 15l-6-6-6 6" />
        </svg>
        {change}
      </span>
    </div>
  );
}

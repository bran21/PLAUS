"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
import styles from "./Navigation.module.css";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="/" className={styles.logo} id="nav-logo">
          <div className={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 1600 1600" style={{ boxShadow: "0 2px 8px rgba(255, 0, 76, 0.2)", borderRadius: "50%" }}>
              <clipPath id="circleClip">
                <circle cx="800" cy="800" r="800" />
              </clipPath>
              <image href="/plaus.jpeg" width="1600" height="1600" clipPath="url(#circleClip)" />
            </svg>
          </div>
          <span className={styles.logoText}>
            Plaus<span className={styles.logoAccent}>Protocol</span>
          </span>
          <span className={styles.logoBeta}>DEVNET</span>
        </a>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          <a href="#markets" className={styles.navLink} id="nav-markets">Markets</a>
          <a href="#trade" className={styles.navLink} id="nav-trade">Trade</a>
          <a href="#portfolio" className={styles.navLink} id="nav-portfolio">Portfolio</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.navLink} id="nav-docs">Docs</a>
        </nav>

        {/* Wallet */}
        <div className={styles.actions}>
          <WalletMultiButton className={styles.walletBtn} />
          <button
            className={`${styles.mobileToggle} btn btn-ghost btn-icon`}
            onClick={() => setMobileOpen(!mobileOpen)}
            id="nav-mobile-toggle"
            aria-label="Toggle mobile menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className={styles.mobileNav}>
          <a href="#markets" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Markets</a>
          <a href="#trade" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Trade</a>
          <a href="#portfolio" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Portfolio</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.mobileNavLink}>Docs</a>
        </div>
      )}
    </header>
  );
}

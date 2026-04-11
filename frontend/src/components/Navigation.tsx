"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Link from "next/link";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
import styles from "./Navigation.module.css";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isApp = pathname?.startsWith("/app");

  const navLinks = [
    { name: "RWA", href: isApp ? "#markets" : "/app#markets", id: "nav-markets" },
    { name: "Swap", href: isApp ? "#trade" : "/app#trade", id: "nav-trade" },
    { name: "Portfolio", href: isApp ? "#portfolio" : "/app#portfolio", id: "nav-portfolio" },
    { name: "AI Agent", href: isApp ? "#agent" : "/app#agent", id: "nav-agent" },
    { name: "Docs", href: "https://github.com", id: "nav-docs", external: true },
  ];

  return (
    <header className={isApp ? styles.headerSidebar : styles.header}>
      <div className={isApp ? styles.innerSidebar : `container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={`${styles.logo} ${isApp ? styles.logoSidebar : ""}`} id="nav-logo">
          <div className={styles.logoIcon}>
            <img
              src="/plaus.png"
              alt="Plaus Protocol Logo"
              width="40"
              height="40"
              style={{
                borderRadius: "50%",
                boxShadow: "0 0 0 2px rgba(0, 214, 143, 0.15), 0 4px 16px rgba(0, 214, 143, 0.2)",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
          <span className={styles.logoText}>
            Plaus<span className={styles.logoAccent}>Protocol</span>
          </span>
          {!isApp && <span className={styles.logoBeta}>DEVNET</span>}
        </Link>

        {/* Desktop Nav */}
        <nav className={isApp ? styles.navSidebar : styles.nav}>
          {navLinks.map((link) => (
            link.external ? (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.navLink} ${isApp ? styles.navLinkSidebar : ""}`}
                id={link.id}
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.id}
                href={link.href}
                className={`${styles.navLink} ${isApp ? styles.navLinkSidebar : ""}`}
                id={link.id}
              >
                {link.name}
              </Link>
            )
          ))}
        </nav>

        {/* Wallet & Launch App */}
        <div className={isApp ? styles.actionsSidebar : styles.actions}>
          {!isApp && (
            <Link href="/app" className={`btn btn-primary ${styles.launchBtn}`}>
              Launch App
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </Link>
          )}
          {isApp && <WalletMultiButton className={`${styles.walletBtn} ${isApp ? styles.walletBtnSidebar : ""}`} />}
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
          {navLinks.map((link) => (
            link.external ? (
              <a key={`${link.id}-mobile`} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
                {link.name}
              </a>
            ) : (
              <Link key={`${link.id}-mobile`} href={link.href} className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
                {link.name}
              </Link>
            )
          ))}
          {!isApp && (
            <Link href="/app" className={styles.mobileNavLink} style={{ color: 'var(--accent)' }} onClick={() => setMobileOpen(false)}>
              Launch App
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

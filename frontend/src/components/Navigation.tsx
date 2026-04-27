"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Link from "next/link";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
import styles from "./Navigation.module.css";

const navIcons: Record<string, React.ReactNode> = {
  RWA: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Swap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  Portfolio: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  "AI Agent": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
      <path d="M9 17h6" />
    </svg>
  ),
  Docs: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
};

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isApp = pathname?.startsWith("/app");

  useEffect(() => {
    if (isApp) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isApp]);

  const navLinks = [
    { name: "RWA", href: isApp ? "#markets" : "/app#markets", id: "nav-markets" },
    { name: "Swap", href: isApp ? "#trade" : "/app#trade", id: "nav-trade" },
    { name: "Portfolio", href: isApp ? "#portfolio" : "/app#portfolio", id: "nav-portfolio" },
    { name: "AI Agent", href: isApp ? "#agent" : "/app#agent", id: "nav-agent" },
    { name: "Docs", href: "https://github.com", id: "nav-docs", external: true },
  ];

  const headerClass = isApp
    ? styles.headerSidebar
    : `${styles.header} ${scrolled ? styles.headerScrolled : styles.headerTransparent}`;

  return (
    <header className={headerClass}>
      <div className={isApp ? styles.innerSidebar : `container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={`${styles.logo} ${isApp ? styles.logoSidebar : ""}`} id="nav-logo">
          <div className={styles.logoIcon}>
            <img
              src="/plaus.png"
              alt="Plaus Protocol Logo"
              width="36"
              height="36"
              style={{
                borderRadius: "50%",
                border: "2px solid rgba(56, 224, 187, 0.15)",
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
          {isApp && <div className={styles.navLabel}>Navigation</div>}
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.navLink} ${isApp ? styles.navLinkSidebar : ""}`}
                id={link.id}
              >
                {isApp && <span className={styles.navIcon}>{navIcons[link.name]}</span>}
                {link.name}
                {link.external && isApp && (
                  <svg className={styles.externalIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                )}
              </a>
            ) : (
              <Link
                key={link.id}
                href={link.href}
                className={`${styles.navLink} ${isApp ? styles.navLinkSidebar : ""}`}
                id={link.id}
              >
                {isApp && <span className={styles.navIcon}>{navIcons[link.name]}</span>}
                {link.name}
              </Link>
            )
          )}
        </nav>

        {/* Wallet & Launch App */}
        <div className={isApp ? styles.actionsSidebar : styles.actions}>
          {!isApp && (
            <Link href="/app" className={`btn btn-primary ${styles.launchBtn}`}>
              Launch App
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px' }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
          {isApp && (
            <>
              <div className={styles.networkBadge}>
                <span className="pulse-dot" />
                <span>Devnet</span>
              </div>
              <WalletMultiButton className={`${styles.walletBtn} ${isApp ? styles.walletBtnSidebar : ""}`} />
            </>
          )}
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
          {navLinks.map((link) =>
            link.external ? (
              <a key={`${link.id}-mobile`} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
                {link.name}
              </a>
            ) : (
              <Link key={`${link.id}-mobile`} href={link.href} className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>
                {link.name}
              </Link>
            )
          )}
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

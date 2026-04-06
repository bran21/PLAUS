"use client";
import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoText}>Plaus<span className={styles.logoAccent}>Protocol</span></span>
            </Link>
            <p className={styles.tagline}>Institutional-grade real-world asset tokenization for the decentralized era.</p>
          </div>
          <div className={styles.links}>
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>Product</h4>
              <Link href="/app#markets" className={styles.link}>Markets</Link>
              <Link href="/app#trade" className={styles.link}>Swap</Link>
              <Link href="/app#portfolio" className={styles.link}>Portfolio</Link>
            </div>
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>Resources</h4>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.link}>Documentation</a>
              <a href="#" className={styles.link}>Whitepaper</a>
              <a href="#" className={styles.link}>Audit Reports</a>
            </div>
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>Social</h4>
              <a href="#" className={styles.link}>Twitter (X)</a>
              <a href="#" className={styles.link}>Discord</a>
              <a href="#" className={styles.link}>Telegram</a>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <span className={styles.copyright}>© {currentYear} Plaus Protocol. Built on Solana.</span>
          <div className={styles.privacy}>
            <Link href="#" className={styles.link}>Privacy Policy</Link>
            <Link href="#" className={styles.link}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

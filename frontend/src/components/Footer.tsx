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
              <span>Plaus<span className={styles.logoAccent}>Protocol</span></span>
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
              <a href="#" className={styles.link}>
                <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                </svg>
                Twitter (X)
              </a>
              <a href="#" className={styles.link}>
                <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Discord
              </a>
              <a href="#" className={styles.link}>
                <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                Telegram
              </a>
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

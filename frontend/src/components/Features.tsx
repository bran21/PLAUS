"use client";
import React from "react";
import styles from "./Features.module.css";

export default function Features() {
  const features = [
    {
      title: "Fractional Ownership",
      description: "Invest in high-value assets with as little as $1. Own pieces of real estate, sustainable farms, and global infrastructure.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      color: "var(--accent)",
    },
    {
      title: "AI Intent Engine",
      description: "Let our AI agents execute complex investment strategies based on your simple natural language prompts.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
          <path d="M12 8v4l3 3" />
        </svg>
      ),
      color: "var(--blue)",
    },
    {
      title: "Solana Speed",
      description: "Experience near-instant settlement and negligible fees. Built on the fastest blockchain for real-time DeFi.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      color: "var(--purple)",
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>The Future of <span className="text-accent-gradient">Real World Assets</span></h2>
          <p className={styles.subtitle}>Combining the stability of traditional assets with the efficiency of decentralized finance.</p>
        </div>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={`glass ${styles.card}`}>
              <div className={styles.iconWrapper} style={{ backgroundColor: `rgba(${feature.color}, 0.1)`, color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

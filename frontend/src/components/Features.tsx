"use client";
import React, { useEffect, useRef, useState } from "react";
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
      color: "#00d68f",
      bgColor: "rgba(0, 214, 143, 0.1)",
    },
    {
      title: "AI Intent Engine",
      description: "Let our AI agents execute complex investment strategies based on your simple natural language prompts.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
          <circle cx="15" cy="13" r="1" fill="currentColor" />
          <path d="M9 17h6" />
        </svg>
      ),
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Solana Speed",
      description: "Experience near-instant settlement and negligible fees. Built on the fastest blockchain for real-time DeFi.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      color: "#7c3aed",
      bgColor: "rgba(124, 58, 237, 0.1)",
    },
    {
      title: "Permissionless Access",
      description: "No KYC walls. No minimum balance. Anyone with a Solana wallet can participate in global asset markets instantly.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
  ];

  // IntersectionObserver for scroll reveal
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean[]>(new Array(features.length).fill(false));

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll(`.${styles.card}`);
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setVisible((prev) => {
              const next = [...prev];
              next[idx] = true;
              return next;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>The Future of <span className="text-accent-gradient">Real World Assets</span></h2>
          <p className={styles.subtitle}>Combining the stability of traditional assets with the efficiency of decentralized finance.</p>
        </div>
        <div className={styles.grid} ref={gridRef}>
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className={`glass ${styles.card} ${visible[index] ? styles.cardVisible : ""}`}
              style={{
                transitionDelay: `${index * 0.12}s`,
                "--card-accent": feature.color,
              } as React.CSSProperties}
            >
              <div
                className={styles.iconWrapper}
                style={{ backgroundColor: feature.bgColor, color: feature.color }}
              >
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

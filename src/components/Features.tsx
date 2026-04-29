"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./Features.module.css";

export default function Features() {
  const features = [
    {
      title: "Fractional Ownership",
      description:
        "Invest in high-value assets with as little as $1. Own pieces of real estate, sustainable farms, and global infrastructure — all tokenized on Solana.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      gradient: "linear-gradient(135deg, #38e0bb, #22c9e0)",
    },
    {
      title: "AI Intent Engine",
      description:
        "Let our AI agents execute complex investment strategies based on your simple natural language prompts. No code, no complexity — just intent.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
          <circle cx="15" cy="13" r="1" fill="currentColor" />
          <path d="M9 17h6" />
        </svg>
      ),
      gradient: "linear-gradient(135deg, #4f8df7, #8b5cf6)",
    },
    {
      title: "Solana Speed",
      description:
        "Experience near-instant settlement and negligible fees. Built on the fastest blockchain for real-time DeFi interactions.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      gradient: "linear-gradient(135deg, #8b5cf6, #c084fc)",
    },
    {
      title: "Permissionless Access",
      description:
        "No KYC walls. No minimum balance. Anyone with a Solana wallet can participate in global asset markets instantly.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      gradient: "linear-gradient(135deg, #f7b955, #f59e0b)",
    },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean[]>(new Array(features.length).fill(false));

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(`.${styles.featureCard}`);
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
        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.sectionTag}>Why Plaus Protocol</span>
          <h2 className={styles.title}>
            Built for the Next Era of{" "}
            <span className="text-accent-gradient">Finance</span>
          </h2>
          <p className={styles.subtitle}>
            Combining the stability of traditional assets with the efficiency and transparency of decentralized finance.
          </p>
        </div>

        {/* Feature grid */}
        <div className={styles.featureGrid} ref={sectionRef}>
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className={`${styles.featureCard} ${visible[index] ? styles.featureVisible : ""}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className={styles.featureIconWrap} style={{ background: feature.gradient }}>
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
              <div className={styles.featureGlow} style={{ background: feature.gradient }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

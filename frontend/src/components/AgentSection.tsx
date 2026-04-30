"use client";
import React, { useState } from "react";
import styles from "./AgentSection.module.css";

const CAPABILITY_CARDS = [
  {
    icon: "🔬",
    mode: "Research",
    color: "#0d9f6e",
    title: "Asset Research",
    items: [
      "Compare yields across all RWA sectors",
      "Risk ratings & oracle health checks",
      "TVL depth and liquidity analysis",
      "30-day APY trending and forecasts",
    ],
  },
  {
    icon: "🕵️",
    mode: "Investigate",
    color: "#6366f1",
    title: "On-Chain Intelligence",
    items: [
      "Real-time arbitrage window scanning",
      "Anomaly & wash-trade detection",
      "Oracle price feed verification",
      "Pool reserve & sentiment analysis",
    ],
  },
  {
    icon: "⚡",
    mode: "Transact",
    color: "#f59e0b",
    title: "Automated Execution",
    items: [
      "Natural language → signed transaction",
      "invest_funds(), liquidate_rwa(), swap()",
      "Multi-step rebalancing sequences",
      "Simulation before wallet signature",
    ],
  },
];

const EXAMPLE_INTENTS = [
  { label: "Research", text: "\"Analyse Java Coffee Farm yield versus PALM\"", tab: "research" },
  { label: "Investigate", text: "\"Are there any arbitrage windows open right now?\"", tab: "investigate" },
  { label: "Transact", text: "\"Invest 200 USDC in PALM and add half as liquidity\"", tab: "transact" },
];

export default function AgentSection() {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <section id="agent" className={styles.section}>
      <div className={styles.bgBlob1} />
      <div className={styles.bgBlob2} />

      <div className={`container ${styles.inner}`}>
        {/* Heading */}
        <div className={styles.heading}>
          <span className={styles.badge}>
            <span className="pulse-dot" style={{ marginRight: "0.4rem" }} />
            AI Intent Engine
          </span>
          <h2 className={styles.title}>
            Your On-Chain<br />
            <span className={styles.titleAccent}>AI Research & Trading Agent</span>
          </h2>
          <p className={styles.subtitle}>
            The Plaus AI Agent combines real-time on-chain intelligence with natural language execution.
            Describe your intent — it researches, investigates, and transacts for you.
          </p>
        </div>

        {/* Capability cards */}
        <div className={styles.cards}>
          {CAPABILITY_CARDS.map((card, i) => (
            <div
              key={i}
              className={`${styles.card} ${activeCard === i ? styles.cardActive : ""}`}
              onClick={() => setActiveCard(i)}
              style={{ "--card-color": card.color } as React.CSSProperties}
              id={`agent-card-${card.mode.toLowerCase()}`}
            >
              <div className={styles.cardIcon}>{card.icon}</div>
              <div className={styles.cardMode}>{card.mode}</div>
              <div className={styles.cardTitle}>{card.title}</div>
              <ul className={styles.cardList}>
                {card.items.map((item, j) => (
                  <li key={j}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Intent examples */}
        <div className={styles.examples}>
          <div className={styles.examplesLabel}>Example intents:</div>
          <div className={styles.examplesList}>
            {EXAMPLE_INTENTS.map((ex, i) => (
              <div key={i} className={styles.exampleItem}>
                <span className={styles.exampleBadge}>{ex.label}</span>
                <span className={styles.exampleText}>{ex.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              const fab = document.getElementById("ai-agent-fab");
              if (fab) fab.click();
            }}
            id="agent-section-open-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem" }}>
              <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
              <circle cx="9" cy="13" r="1" fill="currentColor" />
              <circle cx="15" cy="13" r="1" fill="currentColor" />
              <path d="M9 17h6" />
            </svg>
            Open AI Agent
          </button>
          <p className={styles.ctaNote}>No sign-up. Powered by intent-based function calling on Solana Devnet.</p>
        </div>
      </div>
    </section>
  );
}

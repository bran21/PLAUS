"use client";
import React from "react";
import styles from "./HowItWorks.module.css";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Securely link your Solana wallet to the Plaus Protocol dashboard in one click.",
    },
    {
      number: "02",
      title: "Select Asset",
      description: "Browse curated real-world asset pools and choose your investment tier.",
    },
    {
      number: "03",
      title: "Confirm & Earn",
      description: "Review terms, confirm your deposit, and start accumulating on-chain yields.",
    },
  ];

  return (
    <section className={styles.howItWorks}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Get Started in <span className="text-accent-gradient">Minutes</span></h2>
        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.numberRow}>
                <span className={styles.number}>{step.number}</span>
                <div className={styles.line} />
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./HowItWorks.module.css";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Securely link your Solana wallet to the Plaus Protocol dashboard in one click.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Select Asset",
      description: "Browse curated real-world asset pools and choose your investment tier.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Confirm & Earn",
      description: "Review terms, confirm your deposit, and start accumulating on-chain yields.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean[]>(new Array(steps.length).fill(false));

  useEffect(() => {
    const stepEls = sectionRef.current?.querySelectorAll(`.${styles.step}`);
    if (!stepEls) return;

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
      { threshold: 0.2 }
    );

    stepEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.howItWorks}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.sectionTag}>How It Works</span>
          <h2 className={styles.sectionTitle}>
            Get Started in <span className="text-accent-gradient">Minutes</span>
          </h2>
        </div>
        <div className={styles.steps} ref={sectionRef}>
          {steps.map((step, index) => (
            <div
              key={index}
              data-index={index}
              className={`${styles.step} ${visible[index] ? styles.stepVisible : ""}`}
              style={{ transitionDelay: `${index * 0.15}s` }}
            >
              <div className={styles.stepTop}>
                <div className={styles.iconWrap}>
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={styles.connector}>
                    <div className={`${styles.connectorFill} ${visible[index] ? styles.connectorVisible : ""}`} />
                  </div>
                )}
              </div>
              <div className={styles.stepNumber}>{step.number}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

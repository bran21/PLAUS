"use client";
import React, { useEffect, useRef, useState } from "react";
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
        <h2 className={styles.sectionTitle}>Get Started in <span className="text-accent-gradient">Minutes</span></h2>
        <div className={styles.steps} ref={sectionRef}>
          {steps.map((step, index) => (
            <div
              key={index}
              data-index={index}
              className={`${styles.step} ${visible[index] ? styles.stepVisible : ""}`}
              style={{ transitionDelay: `${index * 0.2}s` }}
            >
              <div className={styles.numberWrapper}>
                <span className={styles.number}>{step.number}</span>
                {index < steps.length - 1 && (
                  <div className={styles.connector}>
                    <div className={`${styles.connectorFill} ${visible[index] ? styles.connectorVisible : ""}`} />
                  </div>
                )}
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

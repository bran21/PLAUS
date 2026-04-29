"use client";
import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import styles from "./Portfolio.module.css";

interface Holding {
  ticker: string;
  name: string;
  amount: string;
  value: string;
  apy: string;
  baseYield: number;
  bonusYield: number;
  yieldFrequency: string;
  accumulatedYield: string;
  pendingYield: string;
  nextPayout: string;
  change: string;
  address?: string;
}

const MOCK_HOLDINGS: Holding[] = [
  {
    ticker: "CROP",
    name: "Cropify Token",
    amount: "1,000,000",
    value: "$5,000,000",
    apy: "12.5%",
    baseYield: 8.5,
    bonusYield: 4.0,
    yieldFrequency: "Monthly",
    accumulatedYield: "$312.50",
    pendingYield: "$52.08",
    nextPayout: "Apr 30",
    change: "+$150.00",
    address: "BEsztBGwPpgmfnsT5jBJeNRizx1FzLurPyDVD4X5vtj5",
  },
  {
    ticker: "USDC",
    name: "USD Coin Mock",
    amount: "1,000,000",
    value: "$1,000,000",
    apy: "5.0%",
    baseYield: 5.0,
    bonusYield: 0,
    yieldFrequency: "Daily",
    accumulatedYield: "$50.00",
    pendingYield: "$2.74",
    nextPayout: "Daily",
    change: "+$50.00",
    address: "GZuZXotcWT9aCSACWs8WWbXH2czVRDh9riPtWL7MRK5a",
  },
  {
    ticker: "IDRX",
    name: "IDR Stablecoin Mock",
    amount: "100,000,000",
    value: "$6,250",
    apy: "7.0%",
    baseYield: 5.0,
    bonusYield: 2.0,
    yieldFrequency: "Weekly",
    accumulatedYield: "$21.88",
    pendingYield: "$4.20",
    nextPayout: "Apr 14",
    change: "+$5.50",
    address: "2DyHbi9PxPngSgnqLAADbArK65cF5sVwccAwAHhgsqMD",
  },
  {
    ticker: "JAVA",
    name: "Java Coffee Estate",
    amount: "4.00",
    value: "$100.00",
    apy: "14.2%",
    baseYield: 10.5,
    bonusYield: 3.7,
    yieldFrequency: "Monthly",
    accumulatedYield: "$3.55",
    pendingYield: "$1.18",
    nextPayout: "Apr 30",
    change: "+$3.20",
  },
  {
    ticker: "PALM",
    name: "Palm Oil Yield Fund",
    amount: "10.00",
    value: "$100.00",
    apy: "16.5%",
    baseYield: 11.5,
    bonusYield: 5.0,
    yieldFrequency: "Weekly",
    accumulatedYield: "$4.13",
    pendingYield: "$0.95",
    nextPayout: "Apr 14",
    change: "+$5.10",
  },
];

const DEVNET_TOKENS = {
  USDC: "4ayMQNSs3euPf153WisuS6cZvB6cbcjcat5vcGuBuC8d",
  IDRX: "v15x8NaCm2teDnVu5M5dhdP5trV1D6YejF8m7a46ovF",
  CROP: "9pH2RaHXG82Ai4iiLKX6xM6rTmqrkbDpWQPfZWTKbVq4",
};

export default function Portfolio() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [holdings, setHoldings] = useState<Holding[]>(MOCK_HOLDINGS);

  useEffect(() => {
    async function fetchBalances() {
      if (!publicKey) return;

      const newHoldings = [...MOCK_HOLDINGS];

      for (const [ticker, mintAddress] of Object.entries(DEVNET_TOKENS)) {
        try {
          const mint = new PublicKey(mintAddress);
          const ata = await getAssociatedTokenAddress(mint, publicKey);
          const account = await getAccount(connection, ata);
          const balance = Number(account.amount) / 1_000_000;

          const index = newHoldings.findIndex((h) => h.ticker === ticker);
          if (index !== -1) {
            newHoldings[index] = {
              ...newHoldings[index],
              amount: balance.toLocaleString(),
              address: mintAddress,
            };
          }
        } catch {
          console.log(`No account for ${ticker} or error fetching`);
        }
      }
      setHoldings(newHoldings);
    }
    fetchBalances();
  }, [publicKey, connection]);

  // Calculate totals
  const totalYieldEarned = holdings.reduce((sum, h) => {
    return sum + parseFloat(h.accumulatedYield.replace(/[$,]/g, ""));
  }, 0);
  const totalPending = holdings.reduce((sum, h) => {
    return sum + parseFloat(h.pendingYield.replace(/[$,]/g, ""));
  }, 0);

  return (
    <section className={styles.section} id="portfolio">
      <div className="container">
        <h2 className={styles.sectionTitle}>Your Portfolio</h2>
        <p className={styles.sectionSub}>
          Track your fractionalized RWA holdings, accumulated yield, and pending
          distributions.
        </p>

        {connected ? (
          <div className={styles.content}>
            {/* Summary Cards */}
            <div className={styles.summaryRow}>
              <div className={`glass ${styles.summaryCard}`}>
                <span className={styles.summaryLabel}>Total Value</span>
                <span className={styles.summaryValue}>$200.00</span>
              </div>
              <div className={`glass ${styles.summaryCard}`}>
                <span className={styles.summaryLabel}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }}
                  >
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                  Total Yield Earned
                </span>
                <span className={`${styles.summaryValue} ${styles.yieldVal}`}>
                  +${totalYieldEarned.toFixed(2)}
                </span>
              </div>
              <div className={`glass ${styles.summaryCard}`}>
                <span className={styles.summaryLabel}>Pending Yield</span>
                <span className={`${styles.summaryValue} ${styles.pendingVal}`}>
                  ${totalPending.toFixed(2)}
                </span>
              </div>
              <div className={`glass ${styles.summaryCard}`}>
                <span className={styles.summaryLabel}>Assets Held</span>
                <span className={styles.summaryValue}>{holdings.length}</span>
              </div>
            </div>

            {/* Holdings Table */}
            <div className={`glass-elevated ${styles.table}`}>
              <div className={styles.tableHeader}>
                <span>Asset</span>
                <span>Amount</span>
                <span>Value</span>
                <span>APY</span>
                <span>Yield Earned</span>
                <span>Pending</span>
                <span>Next Payout</span>
                <span></span>
              </div>
              {holdings.map((h) => (
                <div className={styles.tableRow} key={h.ticker}>
                  <div className={styles.assetCell}>
                    <span className={styles.assetTicker}>${h.ticker}</span>
                    <span className={styles.assetName}>{h.name}</span>
                  </div>
                  <span>{h.amount}</span>
                  <span>{h.value}</span>
                  <div className={styles.apyCell}>
                    <span className={styles.yieldVal}>{h.apy}</span>
                    <div className={styles.miniYieldBar}>
                      <div
                        className={styles.miniYieldBase}
                        style={{
                          width: `${
                            h.bonusYield > 0
                              ? (h.baseYield / (h.baseYield + h.bonusYield)) *
                                100
                              : 100
                          }%`,
                        }}
                      />
                      {h.bonusYield > 0 && (
                        <div
                          className={styles.miniYieldBonus}
                          style={{
                            width: `${
                              (h.bonusYield / (h.baseYield + h.bonusYield)) *
                              100
                            }%`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <span className={styles.yieldVal}>{h.accumulatedYield}</span>
                  <span className={styles.pendingVal}>{h.pendingYield}</span>
                  <span className={styles.payoutCell}>{h.nextPayout}</span>
                  <button
                    className={`btn btn-secondary btn-sm ${styles.claimBtn}`}
                    id={`claim-${h.ticker.toLowerCase()}-btn`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Claim
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`glass ${styles.empty}`}>
            <div className={styles.emptyIcon}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M2 10h20" />
                <path d="M6 14h4" />
              </svg>
            </div>
            <h3>Connect Your Wallet</h3>
            <p>
              Connect a Solana wallet to view your RWA portfolio, track yield,
              and claim pending distributions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

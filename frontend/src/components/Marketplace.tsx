"use client";
import React, { useState } from "react";
import styles from "./Marketplace.module.css";

interface RwaAsset {
  id: number;
  name: string;
  ticker: string;
  category: string;
  categoryColor: "green" | "blue" | "purple" | "amber";
  apy: string;
  priceUsdc: number;
  totalSupply: string;
  tvl: string;
  investors: number;
  change24h: string;
  status: "live" | "upcoming";
}

const MOCK_ASSETS: RwaAsset[] = [
  {
    id: 1,
    name: "Java Premium Coffee Estate",
    ticker: "JAVA",
    category: "Agriculture",
    categoryColor: "green",
    apy: "14.2",
    priceUsdc: 25.0,
    totalSupply: "5,000",
    tvl: "$125,000",
    investors: 312,
    change24h: "+2.4",
    status: "live",
  },
  {
    id: 2,
    name: "Skyline Commercial Tower",
    ticker: "SKYLN",
    category: "Real Estate",
    categoryColor: "blue",
    apy: "8.5",
    priceUsdc: 100.0,
    totalSupply: "24,000",
    tvl: "$2,400,000",
    investors: 648,
    change24h: "+0.8",
    status: "live",
  },
  {
    id: 3,
    name: "Solar Grid Alpha",
    ticker: "SGRID",
    category: "DePIN",
    categoryColor: "purple",
    apy: "11.0",
    priceUsdc: 50.0,
    totalSupply: "17,000",
    tvl: "$850,000",
    investors: 224,
    change24h: "+5.1",
    status: "live",
  },
  {
    id: 4,
    name: "Bali Resort Collection",
    ticker: "BALI",
    category: "Hospitality",
    categoryColor: "amber",
    apy: "9.8",
    priceUsdc: 75.0,
    totalSupply: "10,000",
    tvl: "$750,000",
    investors: 189,
    change24h: "+1.2",
    status: "live",
  },
  {
    id: 5,
    name: "Palm Oil Yield Fund",
    ticker: "PALM",
    category: "Agriculture",
    categoryColor: "green",
    apy: "16.5",
    priceUsdc: 10.0,
    totalSupply: "100,000",
    tvl: "$1,000,000",
    investors: 456,
    change24h: "+3.7",
    status: "live",
  },
  {
    id: 6,
    name: "EV Charging Network",
    ticker: "EVNET",
    category: "DePIN",
    categoryColor: "purple",
    apy: "12.3",
    priceUsdc: 40.0,
    totalSupply: "8,000",
    tvl: "$320,000",
    investors: 98,
    change24h: "-0.4",
    status: "upcoming",
  },
];

export default function Marketplace() {
  const [selectedAsset, setSelectedAsset] = useState<RwaAsset | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredAssets =
    filter === "all"
      ? MOCK_ASSETS
      : MOCK_ASSETS.filter(
          (a) => a.category.toLowerCase() === filter.toLowerCase()
        );

  const handleInvest = (asset: RwaAsset) => {
    setSelectedAsset(asset);
    setInvestAmount("");
  };

  const tokensReceived =
    investAmount && selectedAsset
      ? (parseFloat(investAmount) / selectedAsset.priceUsdc).toFixed(2)
      : "0.00";

  return (
    <section className={styles.section} id="markets">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h2 className={styles.sectionTitle}>Active Markets</h2>
            <p className={styles.sectionSub}>
              Invest in fractionalized yield-bearing assets. Settle in USDC and IDRX. Trade on any DEX.
            </p>
          </div>
          <div className={styles.filters}>
            {["all", "Agriculture", "Real Estate", "DePIN", "Hospitality"].map(
              (f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${
                    filter === f.toLowerCase() || (f === "all" && filter === "all")
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  onClick={() => setFilter(f === "all" ? "all" : f.toLowerCase())}
                  id={`filter-${f.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {f === "all" ? "All" : f}
                </button>
              )
            )}
          </div>
        </div>

        <div className={styles.grid}>
          {filteredAssets.map((asset, idx) => (
            <div
              key={asset.id}
              className={`glass ${styles.card} animate-slide-up delay-${idx + 1}`}
              id={`rwa-card-${asset.ticker.toLowerCase()}`}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardMeta}>
                  <span className={`badge badge-${asset.categoryColor}`}>
                    {asset.category}
                  </span>
                  {asset.status === "upcoming" && (
                    <span className="badge badge-amber">Soon</span>
                  )}
                </div>
                <span
                  className={`${styles.change} ${
                    asset.change24h.startsWith("-") ? styles.changeNeg : ""
                  }`}
                >
                  {asset.change24h}%
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.ticker}>${asset.ticker}</div>
                <h3 className={styles.cardTitle}>{asset.name}</h3>
              </div>

              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Price</span>
                  <span className={styles.statVal}>
                    ${asset.priceUsdc.toFixed(2)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>APY</span>
                  <span className={`${styles.statVal} ${styles.apyVal}`}>
                    {asset.apy}%
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>TVL</span>
                  <span className={styles.statVal}>{asset.tvl}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Investors</span>
                  <span className={styles.statVal}>
                    {asset.investors.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => handleInvest(asset)}
                  disabled={asset.status === "upcoming"}
                  id={`invest-btn-${asset.ticker.toLowerCase()}`}
                >
                  {asset.status === "upcoming" ? "Coming Soon" : "Invest"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Modal */}
      {selectedAsset && (
        <div className={styles.modalOverlay} onClick={() => setSelectedAsset(null)}>
          <div
            className={`glass-elevated ${styles.modal}`}
            onClick={(e) => e.stopPropagation()}
            id="invest-modal"
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.ticker}>${selectedAsset.ticker}</div>
                <h3 className={styles.modalTitle}>{selectedAsset.name}</h3>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setSelectedAsset(null)}
                id="modal-close-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalStatRow}>
                <div className={styles.modalStat}>
                  <span>Price per Share</span>
                  <strong>${selectedAsset.priceUsdc.toFixed(2)}</strong>
                </div>
                <div className={styles.modalStat}>
                  <span>APY</span>
                  <strong className={styles.apyVal}>{selectedAsset.apy}%</strong>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Amount (USDC/IDRX)
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className={styles.input}
                    id="invest-amount-input"
                  />
                  <div className={styles.inputToken}>USDC/IDRX</div>
                </div>
                <div className={styles.quickAmounts}>
                  {[25, 50, 100, 500].map((amt) => (
                    <button
                      key={amt}
                      className="btn btn-secondary btn-sm"
                      onClick={() => setInvestAmount(String(amt))}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.receiveBox}>
                <span className={styles.receiveLabel}>You will receive</span>
                <span className={styles.receiveValue}>
                  {tokensReceived} <span>${selectedAsset.ticker}</span>
                </span>
              </div>

              <button
                className="btn btn-primary btn-lg btn-full"
                disabled={!investAmount || parseFloat(investAmount) <= 0}
                id="confirm-invest-btn"
              >
                {investAmount && parseFloat(investAmount) > 0
                  ? `Invest ${investAmount}`
                  : "Enter Amount"}
              </button>
              <p className={styles.disclaimer}>
                Transaction will be submitted to Solana Devnet. Connect wallet to sign.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

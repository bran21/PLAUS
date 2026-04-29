"use client";
import React, { useState } from "react";
import styles from "./Marketplace.module.css";
import { RWA_ASSETS_FULL, RwaAssetFull } from "./InvestPage";

interface MarketplaceProps {
  onSelectAsset?: (asset: RwaAssetFull) => void;
}

export default function Marketplace({ onSelectAsset }: MarketplaceProps) {
  const [filter, setFilter] = useState("all");

  const filteredAssets =
    filter === "all"
      ? RWA_ASSETS_FULL
      : RWA_ASSETS_FULL.filter(
          (a) => a.category.toLowerCase() === filter.toLowerCase()
        );

  const handleInvest = (asset: RwaAssetFull) => {
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
  };

  return (
    <section className={styles.section} id="markets">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h2 className={styles.sectionTitle}>Active Markets</h2>
            <p className={styles.sectionSub}>
              Invest in fractionalized yield-bearing assets. Settle in USDC and
              IDRX. Trade on any DEX.
            </p>
          </div>
          <div className={styles.filters}>
            {["all", "Agriculture", "Real Estate", "DePIN", "Hospitality"].map(
              (f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${
                    filter === f.toLowerCase() ||
                    (f === "all" && filter === "all")
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  onClick={() =>
                    setFilter(f === "all" ? "all" : f.toLowerCase())
                  }
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
              className={`glass ${styles.card} animate-slide-up delay-${
                idx + 1
              }`}
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

              {/* Yield Preview Bar */}
              <div className={styles.yieldPreview}>
                <div className={styles.yieldPreviewHeader}>
                  <span className={styles.yieldPreviewLabel}>Yield Breakdown</span>
                  <span className={styles.yieldPreviewTotal}>
                    {asset.totalApy}% APY
                  </span>
                </div>
                <div className={styles.yieldBar}>
                  <div
                    className={styles.yieldBarBase}
                    style={{
                      width: `${(asset.baseYield / asset.totalApy) * 100}%`,
                    }}
                    title={`Base: ${asset.baseYield}%`}
                  />
                  <div
                    className={styles.yieldBarBonus}
                    style={{
                      width: `${(asset.bonusYield / asset.totalApy) * 100}%`,
                    }}
                    title={`Bonus: ${asset.bonusYield}%`}
                  />
                </div>
                <div className={styles.yieldLegend}>
                  <span className={styles.yieldLegendItem}>
                    <span className={styles.yieldDotBase} />
                    Base {asset.baseYield}%
                  </span>
                  <span className={styles.yieldLegendItem}>
                    <span className={styles.yieldDotBonus} />
                    Bonus {asset.bonusYield}%
                  </span>
                </div>
              </div>

              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Price</span>
                  <span className={styles.statVal}>
                    ${asset.priceUsdc.toFixed(2)}
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
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Payout</span>
                  <span className={styles.statVal}>{asset.yieldFrequency}</span>
                </div>
              </div>

              {/* Next Payout */}
              {asset.status === "live" && (
                <div className={styles.nextPayout}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span>Next payout: {asset.nextPayout}</span>
                </div>
              )}

              <div className={styles.cardActions}>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => handleInvest(asset)}
                  disabled={asset.status === "upcoming"}
                  id={`invest-btn-${asset.ticker.toLowerCase()}`}
                >
                  {asset.status === "upcoming" ? "Coming Soon" : "Invest Now"}
                  {asset.status === "live" && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{ marginLeft: "4px" }}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

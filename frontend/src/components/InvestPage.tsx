"use client";
import React, { useState } from "react";
import styles from "./InvestPage.module.css";

export interface RwaAssetFull {
  id: number;
  name: string;
  ticker: string;
  category: string;
  categoryColor: "green" | "blue" | "purple" | "amber";
  description: string;
  location: string;
  priceUsdc: number;
  totalSupply: string;
  tvl: string;
  investors: number;
  change24h: string;
  status: "live" | "upcoming";
  marketCap: string;
  circulatingSupply: string;
  // Yield
  baseYield: number;
  bonusYield: number;
  totalApy: number;
  yieldFrequency: "Daily" | "Weekly" | "Monthly" | "Quarterly";
  nextPayout: string;
  totalDistributed: string;
  yieldHistory: { month: string; apy: number }[];
  // Risk
  riskLevel: "Low" | "Medium" | "High";
  audited: boolean;
  auditor: string;
  insurance: string;
  // Investment
  minInvestment: number;
  lockupPeriod: string;
}

export const RWA_ASSETS_FULL: RwaAssetFull[] = [
  {
    id: 1,
    name: "Java Premium Coffee Estate",
    ticker: "JAVA",
    category: "Agriculture",
    categoryColor: "green",
    description:
      "Fractionalized ownership in a 200-hectare premium arabica coffee estate in Central Java, Indonesia. Revenue generated from specialty coffee exports to 12 countries.",
    location: "Central Java, Indonesia",
    priceUsdc: 25.0,
    totalSupply: "5,000",
    tvl: "$125,000",
    investors: 312,
    change24h: "+2.4",
    status: "live",
    marketCap: "$125,000",
    circulatingSupply: "4,200",
    baseYield: 10.5,
    bonusYield: 3.7,
    totalApy: 14.2,
    yieldFrequency: "Monthly",
    nextPayout: "Apr 30, 2026",
    totalDistributed: "$18,450",
    yieldHistory: [
      { month: "Nov", apy: 12.8 },
      { month: "Dec", apy: 13.1 },
      { month: "Jan", apy: 13.5 },
      { month: "Feb", apy: 14.0 },
      { month: "Mar", apy: 13.8 },
      { month: "Apr", apy: 14.2 },
    ],
    riskLevel: "Medium",
    audited: true,
    auditor: "CertiK",
    insurance: "Nexus Mutual",
    minInvestment: 25,
    lockupPeriod: "30 days",
  },
  {
    id: 2,
    name: "Skyline Commercial Tower",
    ticker: "SKYLN",
    category: "Real Estate",
    categoryColor: "blue",
    description:
      "Grade-A commercial office tower in Jakarta CBD with 95% occupancy rate. Tenants include multinational corporations with long-term leases.",
    location: "Jakarta CBD, Indonesia",
    priceUsdc: 100.0,
    totalSupply: "24,000",
    tvl: "$2,400,000",
    investors: 648,
    change24h: "+0.8",
    status: "live",
    marketCap: "$2,400,000",
    circulatingSupply: "19,800",
    baseYield: 6.0,
    bonusYield: 2.5,
    totalApy: 8.5,
    yieldFrequency: "Quarterly",
    nextPayout: "Jun 30, 2026",
    totalDistributed: "$204,000",
    yieldHistory: [
      { month: "Nov", apy: 8.2 },
      { month: "Dec", apy: 8.3 },
      { month: "Jan", apy: 8.4 },
      { month: "Feb", apy: 8.3 },
      { month: "Mar", apy: 8.5 },
      { month: "Apr", apy: 8.5 },
    ],
    riskLevel: "Low",
    audited: true,
    auditor: "Trail of Bits",
    insurance: "InsurAce",
    minInvestment: 100,
    lockupPeriod: "90 days",
  },
  {
    id: 3,
    name: "Solar Grid Alpha",
    ticker: "SGRID",
    category: "DePIN",
    categoryColor: "purple",
    description:
      "Decentralized solar power grid infrastructure across Bali & Lombok. Revenue from energy sales to PLN (state electricity company) and direct consumers.",
    location: "Bali & Lombok, Indonesia",
    priceUsdc: 50.0,
    totalSupply: "17,000",
    tvl: "$850,000",
    investors: 224,
    change24h: "+5.1",
    status: "live",
    marketCap: "$850,000",
    circulatingSupply: "14,500",
    baseYield: 7.5,
    bonusYield: 3.5,
    totalApy: 11.0,
    yieldFrequency: "Monthly",
    nextPayout: "Apr 30, 2026",
    totalDistributed: "$93,500",
    yieldHistory: [
      { month: "Nov", apy: 9.8 },
      { month: "Dec", apy: 10.2 },
      { month: "Jan", apy: 10.5 },
      { month: "Feb", apy: 10.8 },
      { month: "Mar", apy: 10.9 },
      { month: "Apr", apy: 11.0 },
    ],
    riskLevel: "Medium",
    audited: true,
    auditor: "OtterSec",
    insurance: "Nexus Mutual",
    minInvestment: 50,
    lockupPeriod: "60 days",
  },
  {
    id: 4,
    name: "Bali Resort Collection",
    ticker: "BALI",
    category: "Hospitality",
    categoryColor: "amber",
    description:
      "Portfolio of 5 luxury boutique resorts across Bali featuring 120+ rooms. Revenue from room bookings, spa services, and F&B operations.",
    location: "Bali, Indonesia",
    priceUsdc: 75.0,
    totalSupply: "10,000",
    tvl: "$750,000",
    investors: 189,
    change24h: "+1.2",
    status: "live",
    marketCap: "$750,000",
    circulatingSupply: "8,200",
    baseYield: 6.8,
    bonusYield: 3.0,
    totalApy: 9.8,
    yieldFrequency: "Monthly",
    nextPayout: "Apr 30, 2026",
    totalDistributed: "$73,500",
    yieldHistory: [
      { month: "Nov", apy: 8.5 },
      { month: "Dec", apy: 9.2 },
      { month: "Jan", apy: 8.8 },
      { month: "Feb", apy: 9.5 },
      { month: "Mar", apy: 9.6 },
      { month: "Apr", apy: 9.8 },
    ],
    riskLevel: "Medium",
    audited: true,
    auditor: "CertiK",
    insurance: "InsurAce",
    minInvestment: 75,
    lockupPeriod: "45 days",
  },
  {
    id: 5,
    name: "Palm Oil Yield Fund",
    ticker: "PALM",
    category: "Agriculture",
    categoryColor: "green",
    description:
      "Tokenized yield from 500-hectare sustainable palm oil plantation certified by RSPO. Exports to EU and Asian markets with premium pricing.",
    location: "Kalimantan, Indonesia",
    priceUsdc: 10.0,
    totalSupply: "100,000",
    tvl: "$1,000,000",
    investors: 456,
    change24h: "+3.7",
    status: "live",
    marketCap: "$1,000,000",
    circulatingSupply: "82,000",
    baseYield: 11.5,
    bonusYield: 5.0,
    totalApy: 16.5,
    yieldFrequency: "Weekly",
    nextPayout: "Apr 14, 2026",
    totalDistributed: "$165,000",
    yieldHistory: [
      { month: "Nov", apy: 15.0 },
      { month: "Dec", apy: 15.3 },
      { month: "Jan", apy: 15.8 },
      { month: "Feb", apy: 16.0 },
      { month: "Mar", apy: 16.2 },
      { month: "Apr", apy: 16.5 },
    ],
    riskLevel: "Medium",
    audited: true,
    auditor: "Halborn",
    insurance: "Nexus Mutual",
    minInvestment: 10,
    lockupPeriod: "14 days",
  },
  {
    id: 6,
    name: "EV Charging Network",
    ticker: "EVNET",
    category: "DePIN",
    categoryColor: "purple",
    description:
      "Network of 200+ EV charging stations across Java. Revenue from per-kWh charging fees with growing demand from Indonesia's EV adoption push.",
    location: "Java Island, Indonesia",
    priceUsdc: 40.0,
    totalSupply: "8,000",
    tvl: "$320,000",
    investors: 98,
    change24h: "-0.4",
    status: "upcoming",
    marketCap: "$320,000",
    circulatingSupply: "0",
    baseYield: 8.3,
    bonusYield: 4.0,
    totalApy: 12.3,
    yieldFrequency: "Monthly",
    nextPayout: "TBD",
    totalDistributed: "$0",
    yieldHistory: [
      { month: "Nov", apy: 0 },
      { month: "Dec", apy: 0 },
      { month: "Jan", apy: 0 },
      { month: "Feb", apy: 0 },
      { month: "Mar", apy: 0 },
      { month: "Apr", apy: 12.3 },
    ],
    riskLevel: "High",
    audited: false,
    auditor: "Pending",
    insurance: "None",
    minInvestment: 40,
    lockupPeriod: "90 days",
  },
];

interface InvestPageProps {
  asset: RwaAssetFull;
  onBack: () => void;
}

export default function InvestPage({ asset, onBack }: InvestPageProps) {
  const [investAmount, setInvestAmount] = useState("");
  const [currency, setCurrency] = useState<"USDC" | "IDRX">("USDC");

  const idrxRate = 15625; // 1 USDC ≈ 15,625 IDRX
  const effectivePrice =
    currency === "USDC" ? asset.priceUsdc : asset.priceUsdc * idrxRate;

  const tokensReceived =
    investAmount && parseFloat(investAmount) > 0
      ? (parseFloat(investAmount) / effectivePrice).toFixed(4)
      : "0.0000";

  const investAmountUsdc =
    currency === "USDC"
      ? parseFloat(investAmount) || 0
      : (parseFloat(investAmount) || 0) / idrxRate;

  const projectedMonthly = ((investAmountUsdc * asset.totalApy) / 100 / 12).toFixed(2);
  const projectedQuarterly = ((investAmountUsdc * asset.totalApy) / 100 / 4).toFixed(2);
  const projectedAnnual = ((investAmountUsdc * asset.totalApy) / 100).toFixed(2);

  const maxApy = Math.max(...asset.yieldHistory.map((h) => h.apy), 1);

  const quickAmounts =
    currency === "USDC" ? [25, 50, 100, 500, 1000] : [100000, 500000, 1000000, 5000000];

  return (
    <section className={styles.section} id="invest-detail">
      <div className="container">
        {/* Back Button */}
        <button className={styles.backBtn} onClick={onBack} id="invest-back-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Markets
        </button>

        {/* Asset Header */}
        <div className={styles.assetHeader}>
          <div className={styles.assetHeaderLeft}>
            <div className={styles.assetMeta}>
              <span className={`badge badge-${asset.categoryColor}`}>
                {asset.category}
              </span>
              <span
                className={`badge ${
                  asset.status === "live" ? "badge-green" : "badge-amber"
                }`}
              >
                {asset.status === "live" ? "● Live" : "⏳ Coming Soon"}
              </span>
              <span className={styles.assetTicker}>${asset.ticker}</span>
            </div>
            <h2 className={styles.assetName}>{asset.name}</h2>
            <p className={styles.assetDesc}>{asset.description}</p>
          </div>
          <div className={styles.assetHeaderRight}>
            <span className={styles.priceLabel}>Price per Token</span>
            <span className={styles.priceValue}>
              ${asset.priceUsdc.toFixed(2)}
            </span>
            <span
              className={`${styles.priceChange} ${
                asset.change24h.startsWith("-") ? styles.priceChangeNeg : ""
              }`}
            >
              {asset.change24h}% (24h)
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className={styles.grid}>
          {/* Left Column — Analytics */}
          <div>
            {/* Yield Breakdown */}
            <div className={`glass ${styles.card}`} style={{ marginBottom: "1.5rem" }}>
              <div className={styles.cardTitle}>
                <div className={styles.cardTitleIcon}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
                Yield Breakdown
              </div>

              <div className={styles.yieldGrid}>
                <div className={`${styles.yieldItem} ${styles.yieldItemBase}`}>
                  <span className={styles.yieldLabel}>Base Yield</span>
                  <span className={`${styles.yieldValue} ${styles.yieldValueAccent}`}>
                    {asset.baseYield}%
                  </span>
                </div>
                <div className={`${styles.yieldItem} ${styles.yieldItemBonus}`}>
                  <span className={styles.yieldLabel}>Bonus Yield</span>
                  <span className={`${styles.yieldValue} ${styles.yieldValueBlue}`}>
                    {asset.bonusYield}%
                  </span>
                </div>
                <div className={`${styles.yieldItem} ${styles.yieldItemTotal}`}>
                  <span className={styles.yieldLabel}>Total APY</span>
                  <span className={`${styles.yieldValue} ${styles.yieldValueAccent}`}>
                    {asset.totalApy}%
                  </span>
                </div>
                <div className={`${styles.yieldItem} ${styles.yieldItemFreq}`}>
                  <span className={styles.yieldLabel}>Frequency</span>
                  <span className={styles.yieldValue}>{asset.yieldFrequency}</span>
                </div>
              </div>

              {/* Yield Bar */}
              <div className={styles.yieldBarContainer}>
                <div className={styles.yieldBarLabel}>
                  <span>
                    Base {((asset.baseYield / asset.totalApy) * 100).toFixed(0)}%
                  </span>
                  <span>
                    Bonus {((asset.bonusYield / asset.totalApy) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className={styles.yieldBar}>
                  <div
                    className={`${styles.yieldBarSegment} ${styles.yieldBarBase}`}
                    style={{
                      width: `${(asset.baseYield / asset.totalApy) * 100}%`,
                    }}
                  />
                  <div
                    className={`${styles.yieldBarSegment} ${styles.yieldBarBonus}`}
                    style={{
                      width: `${(asset.bonusYield / asset.totalApy) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Yield History */}
            <div className={`glass ${styles.card}`} style={{ marginBottom: "1.5rem" }}>
              <div className={styles.cardTitle}>
                <div className={styles.cardTitleIcon}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 12h4l3-9 4 18 3-9h4" />
                  </svg>
                </div>
                Yield History (6 Months)
              </div>

              <div className={styles.chartContainer}>
                <div className={styles.chartGrid}>
                  {asset.yieldHistory.map((h, i) => (
                    <div className={styles.chartBarWrapper} key={i}>
                      <div
                        className={styles.chartBar}
                        style={{ height: `${(h.apy / maxApy) * 100}%` }}
                        data-value={`${h.apy}%`}
                      />
                      <span className={styles.chartLabel}>{h.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className={`glass ${styles.card}`} style={{ marginBottom: "1.5rem" }}>
              <div className={styles.cardTitle}>
                <div className={styles.cardTitleIcon}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                Key Metrics
              </div>
              <div className={styles.metricsGrid}>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Total Value Locked</span>
                  <span className={styles.metricValue}>{asset.tvl}</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Market Cap</span>
                  <span className={styles.metricValue}>{asset.marketCap}</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Total Supply</span>
                  <span className={styles.metricValue}>{asset.totalSupply} tokens</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Circulating</span>
                  <span className={styles.metricValue}>{asset.circulatingSupply}</span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Investors</span>
                  <span className={styles.metricValue}>
                    {asset.investors.toLocaleString()}
                  </span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Total Distributed</span>
                  <span className={`${styles.metricValue} ${styles.metricValueGreen}`}>
                    {asset.totalDistributed}
                  </span>
                </div>
              </div>
            </div>

            {/* Asset Details */}
            <div className={`glass ${styles.card}`}>
              <div className={styles.cardTitle}>
                <div className={styles.cardTitleIcon}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                Asset Details
              </div>
              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Location</span>
                  <span className={styles.detailValue}>{asset.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Risk Level</span>
                  <span
                    className={`${styles.riskBadge} ${
                      asset.riskLevel === "Low"
                        ? styles.riskLow
                        : asset.riskLevel === "Medium"
                        ? styles.riskMedium
                        : styles.riskHigh
                    }`}
                  >
                    {asset.riskLevel}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Audit</span>
                  {asset.audited ? (
                    <span className={styles.auditBadge}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {asset.auditor}
                    </span>
                  ) : (
                    <span className={styles.detailValue} style={{ color: "var(--text-muted)" }}>
                      Pending
                    </span>
                  )}
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Insurance</span>
                  <span className={styles.detailValue}>{asset.insurance}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Min. Investment</span>
                  <span className={`${styles.detailValue} ${styles.detailValueGreen}`}>
                    ${asset.minInvestment.toFixed(2)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Lock-up Period</span>
                  <span className={styles.detailValue}>{asset.lockupPeriod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Investment Panel */}
          <div className={styles.investPanel}>
            {/* Next Payout */}
            <div className={styles.payoutCard}>
              <div className={styles.payoutIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div className={styles.payoutInfo}>
                <span className={styles.payoutLabel}>Next Yield Payout</span>
                <span className={styles.payoutDate}>{asset.nextPayout}</span>
              </div>
              <span className={styles.payoutAmount}>
                {asset.yieldFrequency}
              </span>
            </div>

            {/* Investment Form */}
            <div className={`glass-elevated ${styles.investCard}`}>
              <h3 className={styles.investTitle}>Invest in ${asset.ticker}</h3>

              {/* Currency Toggle */}
              <div className={styles.currencyToggle}>
                <button
                  className={`${styles.currencyBtn} ${
                    currency === "USDC" ? styles.currencyBtnActive : ""
                  }`}
                  onClick={() => {
                    setCurrency("USDC");
                    setInvestAmount("");
                  }}
                >
                  USDC
                </button>
                <button
                  className={`${styles.currencyBtn} ${
                    currency === "IDRX" ? styles.currencyBtnActive : ""
                  }`}
                  onClick={() => {
                    setCurrency("IDRX");
                    setInvestAmount("");
                  }}
                >
                  IDRX
                </button>
              </div>

              {/* Amount Input */}
              <div className={styles.investInputGroup}>
                <label className={styles.investInputLabel}>
                  Investment Amount
                </label>
                <div className={styles.investInputWrapper}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className={styles.investInput}
                    id="invest-detail-amount-input"
                    min={0}
                  />
                  <div className={styles.investInputToken}>{currency}</div>
                </div>
              </div>

              {/* Quick Amounts */}
              <div className={styles.quickAmounts}>
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    className="btn btn-secondary btn-sm"
                    onClick={() => setInvestAmount(String(amt))}
                  >
                    {currency === "USDC"
                      ? `$${amt}`
                      : amt >= 1000000
                      ? `${(amt / 1000000).toFixed(0)}M`
                      : `${(amt / 1000).toFixed(0)}K`}
                  </button>
                ))}
              </div>

              {/* Projected Yield Preview */}
              {investAmount && parseFloat(investAmount) > 0 && (
                <div className={styles.yieldPreview}>
                  <div className={styles.yieldPreviewTitle}>
                    Projected Yield @ {asset.totalApy}% APY
                  </div>
                  <div className={styles.yieldPreviewGrid}>
                    <div className={styles.yieldPreviewItem}>
                      <span className={styles.yieldPreviewLabel}>Monthly</span>
                      <span className={styles.yieldPreviewValue}>
                        ${projectedMonthly}
                      </span>
                    </div>
                    <div className={styles.yieldPreviewItem}>
                      <span className={styles.yieldPreviewLabel}>Quarterly</span>
                      <span className={styles.yieldPreviewValue}>
                        ${projectedQuarterly}
                      </span>
                    </div>
                    <div className={styles.yieldPreviewItem}>
                      <span className={styles.yieldPreviewLabel}>Annual</span>
                      <span className={styles.yieldPreviewValue}>
                        ${projectedAnnual}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Receive Box */}
              <div className={styles.receiveBox}>
                <span className={styles.receiveLabel}>You will receive</span>
                <span className={styles.receiveValue}>
                  {tokensReceived} <span>${asset.ticker}</span>
                </span>
              </div>

              {/* Invest Button */}
              <button
                className="btn btn-primary btn-lg btn-full"
                disabled={
                  !investAmount ||
                  parseFloat(investAmount) <= 0 ||
                  asset.status === "upcoming"
                }
                id="confirm-invest-detail-btn"
              >
                {asset.status === "upcoming"
                  ? "Coming Soon"
                  : investAmount && parseFloat(investAmount) > 0
                  ? `Invest ${currency === "USDC" ? "$" : ""}${parseFloat(investAmount).toLocaleString()} ${currency}`
                  : "Enter Amount"}
              </button>

              <p className={styles.disclaimer}>
                Transaction will be submitted to Solana Devnet.
                <br />
                Connect wallet to sign. Min. ${asset.minInvestment} · {asset.lockupPeriod} lock
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

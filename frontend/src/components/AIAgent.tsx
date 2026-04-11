"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./AIAgent.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "research" | "investigate" | "transact";
type TxStatus = "idle" | "preparing" | "simulating" | "awaiting" | "signed" | "confirmed";

interface Message {
  role: "user" | "agent";
  content: string;
  action?: TxAction;
  steps?: ResearchStep[];
  status?: "streaming" | "done";
}

interface TxAction {
  fn: string;
  amount: string;
  token: string;
  price: number;
  units: string;
}

interface ResearchStep {
  label: string;
  detail: string;
  done: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ASSETS: Record<string, { name: string; apy: number; price: number; tvl: string; sector: string; risk: string }> = {
  JAVA:  { name: "Java Coffee Farm",        apy: 14.2, price: 25,  tvl: "$1.2M", sector: "Agriculture", risk: "Low"    },
  PALM:  { name: "Borneo Palm Estate",      apy: 16.5, price: 40,  tvl: "$870K", sector: "Agriculture", risk: "Medium" },
  SKYLN: { name: "Skyline APAC Real Estate",apy: 9.8,  price: 100, tvl: "$4.1M", sector: "Real Estate", risk: "Low"    },
  SGRID: { name: "Solar Grid DePIN",        apy: 12.3, price: 50,  tvl: "$650K", sector: "DePIN",       risk: "Medium" },
  BALI:  { name: "Bali Hospitality Fund",   apy: 11.1, price: 75,  tvl: "$2.0M", sector: "Hospitality", risk: "Medium" },
  EVNET: { name: "EV Network Infrastructure",apy:13.7, price: 60,  tvl: "$880K", sector: "DePIN",       risk: "High"   },
};

const PORTFOLIO: Record<string, number> = { JAVA: 4.0, PALM: 0, SKYLN: 0, SGRID: 2.0, BALI: 0, EVNET: 0 };

const RESEARCH_PROMPTS = [
  "Analyze Java Coffee Farm",
  "Compare all agriculture assets",
  "Best APY right now?",
  "Show me DePIN sector overview",
  "Risk assessment for SKYLN",
];

const INVESTIGATE_PROMPTS = [
  "Scan market for arbitrage opportunities",
  "Check on-chain liquidity depth",
  "Verify oracle price feeds",
  "Flag any anomalous pool movements",
  "What's the sentiment on PALM?",
];

const TRANSACT_PROMPTS = [
  "Invest 100 USDC in Java Coffee",
  "Liquidate my SGRID position",
  "Swap 500 IDRX for BALI tokens",
  "Rebalance portfolio to 50% JAVA",
  "Add 200 USDC liquidity to PALM pool",
];

// ─── Research tab ────────────────────────────────────────────────────────────

function buildResearchReply(input: string): { content: string; steps: ResearchStep[] } {
  const lower = input.toLowerCase();
  const steps: ResearchStep[] = [
    { label: "Fetching on-chain data",       detail: "Reading program accounts from Devnet...",           done: false },
    { label: "Querying oracle price feeds",  detail: "Pulling Pyth USDC/IDRX reference prices...",        done: false },
    { label: "Analysing yield metrics",      detail: "Computing APY, TVL, and 30-day return deltas...",   done: false },
    { label: "Generating summary",           detail: "Composing findings from aggregated data...",         done: false },
  ];

  const matchedKey = Object.keys(ASSETS).find(k => lower.includes(k.toLowerCase()) || lower.includes(ASSETS[k].name.toLowerCase().split(" ")[0]));

  let content = "";
  if (matchedKey) {
    const a = ASSETS[matchedKey];
    content = `📊 **${a.name} (${matchedKey})**\n\n• Sector: ${a.sector}\n• APY: ${a.apy}% (30d avg)\n• Price per token: $${a.price} USDC\n• TVL: ${a.tvl}\n• Risk rating: ${a.risk}\n\n✅ Oracle prices are live and within 0.2% deviation. No anomalous activity detected. Liquidity depth is healthy for positions up to $50K.`;
  } else if (lower.includes("apy") || lower.includes("best") || lower.includes("yield")) {
    content = `🏆 **Top APY Rankings (live)**\n\n1. PALM — 16.5% APY — Agriculture\n2. JAVA — 14.2% APY — Agriculture\n3. EVNET — 13.7% APY — DePIN\n4. SGRID — 12.3% APY — DePIN\n5. BALI — 11.1% APY — Hospitality\n\n💡 PALM offers the highest yield but carries Medium risk. JAVA is recommended for risk-adjusted returns.`;
  } else if (lower.includes("depin") || lower.includes("infra")) {
    content = `⚡ **DePIN Sector Overview**\n\n• SGRID: Solar Grid — $0.65M TVL, 12.3% APY\n• EVNET: EV Network — $0.88M TVL, 13.7% APY\n\nDePIN assets are growing 34% MoM onchain. Both assets are fully permissionless and backed by verified infrastructure KPIs.`;
  } else if (lower.includes("agri") || lower.includes("compare")) {
    content = `🌾 **Agriculture Comparison**\n\n| Asset | APY    | Risk   | TVL   |\n|-------|--------|--------|-------|\n| JAVA  | 14.2%  | Low    | $1.2M |\n| PALM  | 16.5%  | Medium | $870K |\n\nJAVA has superior TVL depth. PALM pays +2.3% more APY but at slightly higher volatility.`;
  } else if (lower.includes("risk") || lower.includes("skyln") || lower.includes("real estate")) {
    content = `🏢 **SKYLN Risk Assessment**\n\nSkyline APAC Real Estate is the lowest-risk asset in the protocol:\n\n• Legal wrapper: Verified Singapore SPV\n• Audit status: ✅ Passed (Ottersec Q1 2026)\n• Oracle: Pyth — deviation < 0.1%\n• Recommended for: Conservative investors seeking stable 9.8% APY`;
  } else {
    content = `I can research any asset or sector. Try:\n\n• "Analyze Java Coffee Farm"\n• "Best APY right now?"\n• "DePIN sector overview"\n• "Risk assessment for SKYLN"`;
  }

  return { content, steps };
}

// ─── Investigate tab ─────────────────────────────────────────────────────────

function buildInvestigateReply(input: string): { content: string; steps: ResearchStep[] } {
  const lower = input.toLowerCase();
  const steps: ResearchStep[] = [
    { label: "Scanning pool reserves",       detail: "Reading AMM vault balances...",                    done: false },
    { label: "Analysing transaction history",detail: "Inspecting last 200 txns for anomalies...",        done: false },
    { label: "Cross-referencing oracles",    detail: "Comparing on-chain vs off-chain pricing...",       done: false },
    { label: "Generating intelligence report",detail: "Summarising findings...",                        done: false },
  ];

  let content = "";
  if (lower.includes("arbitrage")) {
    content = `🔍 **Arbitrage Scan Complete**\n\nFound 1 potential opportunity:\n\n• **PALM/USDC**: Raydium price $40.12 vs protocol AMM $39.95 → +0.42% spread\n• Estimated profit for $5K trade: ~$21 USDC after fees\n• Window: ~8 min based on current block rate\n\n⚠️ Spread is sub-threshold for high-confidence execution. Monitoring.`;
  } else if (lower.includes("liquidity") || lower.includes("depth")) {
    content = `💧 **Liquidity Depth Report**\n\n| Pool       | Depth $5K | Depth $50K | Slippage |\n|------------|-----------|------------|----------|\n| JAVA/USDC  | 0.12%     | 1.8%       | ✅ Healthy|\n| PALM/USDC  | 0.31%     | 4.2%       | ⚠️ Thin  |\n| SGRID/USDC | 0.18%     | 2.1%       | ✅ Healthy|\n\nJAVA pool has the deepest liquidity. Recommend capping PALM trades to $10K.`;
  } else if (lower.includes("oracle") || lower.includes("price feed")) {
    content = `🔮 **Oracle Health Check**\n\n• Pyth USDC/USD: ✅ Live — $1.0001 ±0.01%\n• IDRX/USDC: ✅ Live — 0.0000625 ±0.08%\n• Last heartbeat: 3 seconds ago\n• JAVA price deviation: 0.15% (within threshold)\n\nAll feeds healthy. No stale data detected.`;
  } else if (lower.includes("anomal") || lower.includes("movement") || lower.includes("flag")) {
    content = `🚨 **Anomaly Detection**\n\nScanned last 200 txns across all pools:\n\n• No wash trading detected\n• No flash loan attacks in past 24h\n• PALM pool: 3 large withdrawals ($12K, $8K, $6K) in last 2h — normal seasonal pattern\n• EVNET: Volume spike +180% — likely news-driven, not manipulation\n\n✅ Overall status: CLEAN`;
  } else if (lower.includes("sentiment") || lower.includes("palm")) {
    content = `📡 **PALM Market Sentiment**\n\nAggregated on-chain + social signals:\n\n• Net token flow: +$34K inflows last 7d\n• Holder count: ↑ 12% MoM\n• Social mentions: Positive (87% bullish)\n• Upcoming yield disbursement: 3 days\n\n💚 Sentiment: **Bullish**. Likely positive price action ahead of yield event.`;
  } else {
    content = `I can investigate on-chain data. Try:\n\n• "Scan for arbitrage opportunities"\n• "Check liquidity depth"\n• "Verify oracle price feeds"\n• "Flag anomalous pool movements"`;
  }

  return { content, steps };
}

// ─── Transaction tab ─────────────────────────────────────────────────────────

function buildTransactReply(input: string): { content: string; action?: TxAction } {
  const lower = input.toLowerCase();
  const amountMatch = lower.match(/[\d,]+/);
  const rawAmount = amountMatch ? amountMatch[0].replace(/,/g, "") : "100";
  const amount = parseFloat(rawAmount);

  const matchedKey = Object.keys(ASSETS).find(k =>
    lower.includes(k.toLowerCase()) || lower.includes(ASSETS[k].name.toLowerCase().split(" ")[0])
  );
  const token = matchedKey || "JAVA";
  const asset = ASSETS[token];

  if (lower.includes("invest") || lower.includes("buy")) {
    const units = (amount / asset.price).toFixed(4);
    return {
      content: `✅ Transaction ready:\n\n• Action: **invest_funds()**\n• Input: ${amount} USDC/IDRX\n• Output: ${units} $${token} tokens\n• Price: $${asset.price} per token\n• Est. APY: ${asset.apy}%\n\nThis will call the on-chain escrow vault. Sign with your wallet to confirm.`,
      action: { fn: "invest_funds", amount: rawAmount, token, price: asset.price, units },
    };
  } else if (lower.includes("liquidat") || lower.includes("withdraw")) {
    const holding = PORTFOLIO[token] || 2;
    const value = (holding * asset.price).toFixed(2);
    return {
      content: `✅ Transaction ready:\n\n• Action: **liquidate_rwa()**\n• Burn: ${holding} $${token} tokens\n• Receive: ~${value} USDC/IDRX\n• From escrow vault (+ accrued yield)\n\nSign with your wallet to confirm the liquidation.`,
      action: { fn: "liquidate_rwa", amount: String(holding), token, price: asset.price, units: value },
    };
  } else if (lower.includes("swap")) {
    const currency = lower.includes("idrx") ? "IDRX" : "USDC";
    const units = (amount / asset.price).toFixed(4);
    return {
      content: `✅ Transaction ready:\n\n• Action: **swap() via Jupiter**\n• Route: ${amount} ${currency} → ${units} $${token}\n• Slippage tolerance: 0.5%\n• Estimated fees: ~$0.002\n\nSign with your wallet to execute the swap.`,
      action: { fn: "swap_jupiter", amount: rawAmount, token, price: asset.price, units },
    };
  } else if (lower.includes("rebalance")) {
    return {
      content: `✅ Rebalance plan prepared:\n\n• Sell: 2.0 SGRID ($100 USDC)\n• Buy: 4.0 JAVA ($100 USDC)\n• New allocation: 50% JAVA, 25% SGRID, 25% BALI\n• Estimated total fees: ~$0.01\n\nThis requires 2 sequential transactions. Sign below to start.`,
      action: { fn: "rebalance", amount: "100", token: "JAVA", price: asset.price, units: "4.0" },
    };
  } else if (lower.includes("liquidity") || lower.includes("lp") || lower.includes("add")) {
    const units = (amount / asset.price).toFixed(4);
    return {
      content: `✅ LP transaction ready:\n\n• Action: **add_liquidity()** via Raydium\n• Deposit: ${amount} USDC + ${units} $${token}\n• Pool: ${token}/USDC\n• Est. LP fee APR: ~8.4%\n\nSigning adds both assets to the pool proportionally.`,
      action: { fn: "add_liquidity", amount: rawAmount, token, price: asset.price, units },
    };
  } else {
    return {
      content: `I can prepare transactions. Try:\n\n• "Invest 100 USDC in Java Coffee"\n• "Liquidate my SGRID position"\n• "Swap 500 IDRX for BALI tokens"\n• "Rebalance portfolio to 50% JAVA"\n• "Add 200 USDC liquidity to PALM pool"`,
    };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepProgress({ steps }: { steps: ResearchStep[] }) {
  return (
    <div className={styles.steps}>
      {steps.map((s, i) => (
        <div key={i} className={`${styles.step} ${s.done ? styles.stepDone : styles.stepRunning}`}>
          <span className={styles.stepIcon}>{s.done ? "✓" : <span className={styles.stepSpinner} />}</span>
          <div>
            <div className={styles.stepLabel}>{s.label}</div>
            <div className={styles.stepDetail}>{s.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TxCard({ action, status, onSign }: { action: TxAction; status: TxStatus; onSign: () => void }) {
  const labels: Record<TxStatus, string> = {
    idle:      "🔐 Sign Transaction",
    preparing: "⚙️ Preparing…",
    simulating:"🔬 Simulating…",
    awaiting:  "✍️ Awaiting Signature…",
    signed:    "📡 Broadcasting…",
    confirmed: "✅ Confirmed on Devnet!",
  };

  return (
    <div className={styles.txCard}>
      <div className={styles.txRow}><span>Function</span><code>{action.fn}()</code></div>
      <div className={styles.txRow}><span>Amount</span><strong>{action.amount} USDC/IDRX</strong></div>
      <div className={styles.txRow}><span>Token</span><strong>${action.token}</strong></div>
      <div className={styles.txRow}><span>Units</span><strong>{action.units}</strong></div>
      <button
        className={`btn btn-primary btn-sm ${styles.signBtn} ${status === "confirmed" ? styles.signConfirmed : ""}`}
        onClick={onSign}
        disabled={status !== "idle" && status !== "confirmed"}
        id="ai-sign-tx-btn"
      >
        {labels[status]}
      </button>
      {status === "confirmed" && (
        <p className={styles.txHash}>
          Tx: <a href="#" className={styles.txHashLink}>3xK8…mP2q</a> · View on Solscan
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const INIT: Record<Tab, Message[]> = {
  research: [{
    role: "agent",
    content: "🔬 **Research Mode**\n\nI can analyse any RWA asset, compare yields, assess risk, or give sector overviews. Ask me anything about the protocol's assets.",
    status: "done",
  }],
  investigate: [{
    role: "agent",
    content: "🕵️ **Investigate Mode**\n\nI monitor on-chain data in real time: liquidity depth, oracle health, arbitrage windows, anomaly detection, and market sentiment.",
    status: "done",
  }],
  transact: [{
    role: "agent",
    content: "⚡ **Transact Mode**\n\nDescribe what you want to do — invest, liquidate, swap, add liquidity, or rebalance — and I'll build the transaction and stage it for your wallet signature.",
    status: "done",
  }],
};

export default function AIAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("research");
  const [messages, setMessages] = useState<Record<Tab, Message[]>>(INIT);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  const addMessage = useCallback((t: Tab, msg: Message) => {
    setMessages(prev => ({ ...prev, [t]: [...prev[t], msg] }));
  }, []);

  const simulateSteps = useCallback((steps: ResearchStep[], onDone: () => void) => {
    let i = 0;
    const tick = () => {
      if (i >= steps.length) { onDone(); return; }
      steps[i].done = true;
      i++;
      setTimeout(tick, 600 + Math.random() * 300);
    };
    setTimeout(tick, 400);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { role: "user", content: input, status: "done" };
    const currentTab = tab;
    const currentInput = input;
    addMessage(currentTab, userMsg);
    setInput("");
    setIsTyping(true);
    setTxStatus("idle");

    if (currentTab === "research") {
      const { content, steps } = buildResearchReply(currentInput);
      const stepsCopy = steps.map(s => ({ ...s }));
      simulateSteps(stepsCopy, () => {
        addMessage(currentTab, { role: "agent", content, steps: stepsCopy, status: "done" });
        setIsTyping(false);
      });
      addMessage(currentTab, { role: "agent", content: "", steps: stepsCopy, status: "streaming" });
      // replace streaming placeholder once done via simulateSteps callback above
    } else if (currentTab === "investigate") {
      const { content, steps } = buildInvestigateReply(currentInput);
      const stepsCopy = steps.map(s => ({ ...s }));
      simulateSteps(stepsCopy, () => {
        addMessage(currentTab, { role: "agent", content, steps: stepsCopy, status: "done" });
        setIsTyping(false);
      });
      addMessage(currentTab, { role: "agent", content: "", steps: stepsCopy, status: "streaming" });
    } else {
      setTimeout(() => {
        const { content, action } = buildTransactReply(currentInput);
        addMessage(currentTab, { role: "agent", content, action, status: "done" });
        setIsTyping(false);
      }, 900);
    }
  }, [input, isTyping, tab, addMessage, simulateSteps]);

  const handleSign = useCallback(() => {
    setTxStatus("preparing");
    setTimeout(() => setTxStatus("simulating"), 900);
    setTimeout(() => setTxStatus("awaiting"), 1800);
    setTimeout(() => setTxStatus("signed"), 2700);
    setTimeout(() => setTxStatus("confirmed"), 3800);
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "research",    label: "Research",    icon: "🔬" },
    { id: "investigate", label: "Investigate",  icon: "🕵️" },
    { id: "transact",    label: "Transact",     icon: "⚡" },
  ];

  const suggestionSets: Record<Tab, string[]> = {
    research:    RESEARCH_PROMPTS,
    investigate: INVESTIGATE_PROMPTS,
    transact:    TRANSACT_PROMPTS,
  };

  return (
    <>
      {/* FAB */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ""}`}
        onClick={() => setIsOpen(true)}
        id="ai-agent-fab"
        aria-label="Open AI Agent"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
          <circle cx="15" cy="13" r="1" fill="currentColor" />
          <path d="M9 17h6" />
        </svg>
        <span className={styles.fabLabel}>AI Agent</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className={styles.panel} id="ai-agent-panel">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className="pulse-dot" />
              <h3>AI Agent</h3>
              <span className={styles.headerTag}>Intent Engine</span>
            </div>
            <button
              className={`btn btn-ghost btn-icon ${styles.closeBtn}`}
              onClick={() => setIsOpen(false)}
              id="ai-agent-close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {tabs.map(t => (
              <button
                key={t.id}
                className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ""}`}
                onClick={() => { setTab(t.id); setTxStatus("idle"); }}
                id={`ai-tab-${t.id}`}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className={styles.messages} ref={chatRef}>
            {messages[tab].map((msg, i) => (
              <div key={i} className={`${styles.msg} ${msg.role === "user" ? styles.msgUser : styles.msgAgent}`}>
                {msg.role === "agent" && (
                  <div className={styles.agentAvatar}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
                    </svg>
                  </div>
                )}
                <div className={styles.msgBubble}>
                  {/* Step progress (research/investigate streaming) */}
                  {msg.steps && msg.status === "streaming" && (
                    <StepProgress steps={msg.steps} />
                  )}
                  {/* Final content */}
                  {msg.content && (
                    <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
                  )}
                  {/* Transaction card */}
                  {msg.action && (
                    <TxCard action={msg.action} status={txStatus} onSign={handleSign} />
                  )}
                </div>
              </div>
            ))}
            {isTyping && tab === "transact" && (
              <div className={`${styles.msg} ${styles.msgAgent}`}>
                <div className={styles.agentAvatar}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
                  </svg>
                </div>
                <div className={styles.typing}><span /><span /><span /></div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className={styles.suggestions}>
            {suggestionSets[tab].slice(0, 3).map((s, i) => (
              <button
                key={i}
                className={styles.suggestionChip}
                onClick={() => { setInput(s); }}
                id={`ai-suggest-${tab}-${i}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className={styles.inputBar}>
            <input
              type="text"
              placeholder={
                tab === "research"    ? "e.g. Analyse Java Coffee Farm…"    :
                tab === "investigate" ? "e.g. Scan for arbitrage…"           :
                                       "e.g. Invest 100 USDC in PALM…"
              }
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              className={styles.chatInput}
              id="ai-agent-input"
            />
            <button
              className="btn btn-primary btn-icon"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              id="ai-agent-send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

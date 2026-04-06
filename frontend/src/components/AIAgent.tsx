"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./AIAgent.module.css";

interface Message {
  role: "user" | "agent";
  content: string;
  action?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "agent",
    content: "Welcome to RWAFi! I'm your AI investment assistant. I can help you analyze assets, execute investments, and manage your portfolio. Try saying: \"Invest 100 USDC or IDRX in Java Coffee\"",
  },
];

export default function AIAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = input.toLowerCase();
      let response: Message;

      if (lower.includes("invest") && lower.match(/\d+/)) {
        const amount = lower.match(/\d+/)?.[0] || "100";
        const token = lower.includes("java")
          ? "JAVA"
          : lower.includes("skyline") || lower.includes("real estate")
          ? "SKYLN"
          : lower.includes("solar")
          ? "SGRID"
          : lower.includes("bali")
          ? "BALI"
          : "JAVA";

        response = {
          role: "agent",
          content: `Transaction prepared: Invest ${amount} USDC/IDRX → ${(
            parseFloat(amount) / (token === "JAVA" ? 25 : token === "SKYLN" ? 100 : 50)
          ).toFixed(2)} $${token} tokens. Click below to sign with your wallet.`,
          action: `invest_usdc(${amount}, "${token}")`,
        };
      } else if (lower.includes("swap")) {
        response = {
          role: "agent",
          content:
            "I can route swaps through Jupiter aggregator. Which RWA token would you like to swap, and how much USDC/IDRX?",
        };
      } else if (
        lower.includes("portfolio") ||
        lower.includes("balance") ||
        lower.includes("holding")
      ) {
        response = {
          role: "agent",
          content:
            "You currently hold:\n• 4.00 $JAVA (est. $100)\n• 0 $SKYLN\n• 0 $SGRID\n\nTotal portfolio value: $100.00 USDC/IDRX equivalent.",
        };
      } else if (lower.includes("apy") || lower.includes("yield")) {
        response = {
          role: "agent",
          content:
            "Current top yields:\n• PALM — 16.5% APY (Agriculture)\n• JAVA — 14.2% APY (Agriculture)\n• EVNET — 12.3% APY (DePIN)\n\nWould you like to invest in one of these?",
        };
      } else if (lower.includes("liquidate") || lower.includes("withdraw")) {
        response = {
          role: "agent",
          content:
            "To liquidate, burn your RWA tokens to reclaim USDC/IDRX from the escrow vault. How many tokens would you like to liquidate, and which asset?",
        };
      } else {
        response = {
          role: "agent",
          content:
            "I can help you with:\n• **Invest** — \"Invest 50 USDC or IDRX in Java Coffee\"\n• **Swap** — \"Swap USDC/IDRX for SGRID tokens\"\n• **Portfolio** — \"Show my holdings\"\n• **Yields** — \"What are the best APYs?\"\n• **Liquidate** — \"Withdraw my JAVA position\"\n\nWhat would you like to do?",
        };
      }

      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Toggle */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ""}`}
        onClick={() => setIsOpen(true)}
        id="ai-agent-fab"
        aria-label="Open AI Agent"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
          <circle cx="15" cy="13" r="1" fill="currentColor" />
          <path d="M9 17h6" />
        </svg>
      </button>

      {/* Chat */}
      {isOpen && (
        <div className={styles.panel} id="ai-agent-panel">
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
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className={styles.messages} ref={chatRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.msg} ${
                  msg.role === "user" ? styles.msgUser : styles.msgAgent
                }`}
              >
                {msg.role === "agent" && (
                  <div className={styles.agentAvatar}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
                    </svg>
                  </div>
                )}
                <div className={styles.msgBubble}>
                  <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
                  {msg.action && (
                    <button className={`btn btn-primary btn-sm ${styles.actionBtn}`} id="ai-sign-tx-btn">
                      🔐 Sign Transaction
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.msg} ${styles.msgAgent}`}>
                <div className={styles.agentAvatar}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
                  </svg>
                </div>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <div className={styles.inputBar}>
            <input
              type="text"
              placeholder="Try: &quot;Invest 50 USDC or 800K IDRX in Java Coffee&quot;"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className={styles.chatInput}
              id="ai-agent-input"
            />
            <button
              className="btn btn-primary btn-icon"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              id="ai-agent-send"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

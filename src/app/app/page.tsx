"use client";

import { useState } from "react";
import Marketplace from "@/components/Marketplace";
import InvestPage from "@/components/InvestPage";
import { RwaAssetFull } from "@/components/InvestPage";
import TradePanel from "@/components/TradePanel";
import Portfolio from "@/components/Portfolio";
import AIAgent from "@/components/AIAgent";
import AgentSection from "@/components/AgentSection";
import Navigation from "@/components/Navigation";

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState<RwaAssetFull | null>(null);

  const handleSelectAsset = (asset: RwaAssetFull) => {
    setSelectedAsset(asset);
    // Scroll to invest section
    setTimeout(() => {
      const el = document.getElementById("invest-detail");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleBack = () => {
    setSelectedAsset(null);
    setTimeout(() => {
      const el = document.getElementById("markets");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="app-layout">
      <Navigation />
      <main className="page-content app-main">
        <div id="markets">
          <Marketplace onSelectAsset={handleSelectAsset} />
        </div>
        {selectedAsset && (
          <div id="invest">
            <InvestPage asset={selectedAsset} onBack={handleBack} />
          </div>
        )}
        <div id="trade">
          <TradePanel />
        </div>
        <div id="portfolio">
          <Portfolio />
        </div>
        <div id="agent">
          <AgentSection />
        </div>
      </main>
      <AIAgent />
    </div>
  );
}

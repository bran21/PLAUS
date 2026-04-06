import Marketplace from "@/components/Marketplace";
import TradePanel from "@/components/TradePanel";
import Portfolio from "@/components/Portfolio";
import AIAgent from "@/components/AIAgent";
import Navigation from "@/components/Navigation";

export default function App() {
  return (
    <div className="app-layout">
      <Navigation />
      <main className="page-content app-main">
        <div id="markets">
          <Marketplace />
        </div>
        <div id="trade">
          <TradePanel />
        </div>
        <div id="portfolio">
          <Portfolio />
        </div>
      </main>
      <AIAgent />
    </div>
  );
}

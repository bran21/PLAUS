import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Marketplace from "@/components/Marketplace";
import TradePanel from "@/components/TradePanel";
import Portfolio from "@/components/Portfolio";
import AIAgent from "@/components/AIAgent";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="page-content">
        <Hero />
        <Marketplace />
        <TradePanel />
        <Portfolio />
      </main>
      <AIAgent />
    </>
  );
}

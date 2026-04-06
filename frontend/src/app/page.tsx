
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="landing-page">
        <Hero />
        <Features />
        <HowItWorks />

        {/* Final CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container relative z-10">
            <div className="glass p-12 md:p-20 text-center max-w-4xl mx-auto border-accent/20">
              <h2 className="text-4xl md:text-5xl font-800 mb-6 leading-tight">
                Ready to Invest in the <br />
                <span className="text-accent-gradient">Future of Assets?</span>
              </h2>
              <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                Join thousands of investors already leveraging Plaus Protocol to fractionalize and trade high-yield real-world assets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/app" className="btn btn-primary btn-lg">
                  Launch Application
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '8px' }}>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
                  Read Documentation
                </a>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -z-10" />
        </section>
      </main>
      <Footer />
    </>
  );
}



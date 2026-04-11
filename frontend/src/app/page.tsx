
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="landing-page">
        <Hero />
        <Features />
        <HowItWorks />

        {/* Final CTA Section */}
        <section style={{ padding: '8rem 0', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div
              className="glass"
              style={{
                padding: 'clamp(3rem, 6vw, 5rem)',
                textAlign: 'center',
                maxWidth: '800px',
                margin: '0 auto',
                borderColor: 'rgba(0, 214, 143, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Radial glow */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(0, 214, 143, 0.08), transparent 70%)',
                pointerEvents: 'none',
              }} />
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 800,
                marginBottom: '1.25rem',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                position: 'relative',
              }}>
                Ready to Invest in the <br />
                <span className="text-accent-gradient">Future of Assets?</span>
              </h2>
              <p style={{
                fontSize: '1.125rem',
                color: 'var(--text-secondary)',
                marginBottom: '2.5rem',
                maxWidth: '560px',
                margin: '0 auto 2.5rem',
                position: 'relative',
              }}>
                Join thousands of investors already leveraging Plaus Protocol to fractionalize and trade high-yield real-world assets.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
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
        </section>
      </main>
      <Footer />
    </>
  );
}

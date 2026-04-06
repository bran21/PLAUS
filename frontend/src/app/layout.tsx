import type { Metadata } from "next";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";

export const metadata: Metadata = {
  title: "Plaus Protocol — RWA Suite that suit you on Solana",
  description:
    "Invest in tokenized real-world assets using USDC and IDRX on Solana. Trade on secondary DEXs, earn yield, and let AI execute your investment intents.",
  keywords: ["RWA", "DeFi", "Solana", "USDC", "IDRX", "Real World Assets", "Tokenization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="bg-mesh" />
        <div className="bg-grid" />
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}

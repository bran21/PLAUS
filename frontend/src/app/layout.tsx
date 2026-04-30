import type { Metadata } from "next";
import "./globals.css";
import AppWalletProvider from "@/components/AppWalletProvider";

export const metadata: Metadata = {
  title: "Plaus Protocol — RWA Suite that suit you on Solana",
  description:
    "Invest in tokenized real-world assets using USDC and IDRX on Solana. Trade on secondary DEXs, earn yield, and let AI execute your investment intents.",
  keywords: ["RWA", "DeFi", "Solana", "USDC", "IDRX", "Real World Assets", "Tokenization"],
  icons: {
    icon: "/plaus.png",
    shortcut: "/plaus.png",
    apple: "/plaus.png",
  },
  openGraph: {
    title: "Plaus Protocol — RWA Suite that suit you on Solana",
    description:
      "Invest in tokenized real-world assets using USDC and IDRX on Solana.",
    images: [{ url: "/plaus.png", width: 1080, height: 1080, alt: "Plaus Protocol" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Plaus Protocol",
    description: "Invest in tokenized real-world assets on Solana.",
    images: ["/plaus.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}

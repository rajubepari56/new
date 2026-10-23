import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Finlytic AI Agent — Institutional portfolio intelligence",
  description:
    "An autonomous quantitative agent that monitors portfolio telemetry, executes within your risk limits, and logs every order. Dark-mode institutional terminal.",
  openGraph: { title: "Finlytic AI Agent", description: "Autonomous execution. Full audit trail. Institutional control.", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

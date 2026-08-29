import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhisperStell — Trustless Multi-Payer Invoices on Stellar",
  description:
    "Create on-chain invoices where many payers each owe a share. Fully funded, the Soroban contract routes USDC to every recipient at once; unfunded by the deadline, everyone is refunded — automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

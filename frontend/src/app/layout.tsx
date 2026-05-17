import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Offerly — Multi-Agent Merchant Onboarding",
  description:
    "Offerly turns a one-line pitch into a complete, validated promotional campaign in seconds. Powered by six collaborating AI agents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

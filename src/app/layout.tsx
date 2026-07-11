import "./globals.css";
import type { Metadata, Viewport } from "next";

const SITE = "https://sergios-landscaping.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Sergio's Landscaping — Irrigation",
  description: "Irrigation inspection & repair quotes for Sergio's Landscaping.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  appleWebApp: { capable: true, title: "Sergio's", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: "Sergio's Landscaping",
    title: "Sergio's Landscaping — Irrigation",
    description: "Irrigation inspection & repair quotes.",
    url: SITE,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Sergio's Landscaping — Irrigation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sergio's Landscaping — Irrigation",
    description: "Irrigation inspection & repair quotes.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1B3A5B",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}

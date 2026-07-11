import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Sergio's Landscaping — Irrigation",
  description: "Inspection & repair quotes for Sergio's Landscaping",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  appleWebApp: { capable: true, title: "Sergio's", statusBarStyle: "default" },
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

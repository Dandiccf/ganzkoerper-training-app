import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kraftwerk – Ganzkörpertraining",
  description: "Dein ruhiger, offline-fähiger Begleiter für die A/B/C-Ganzkörperrotation.",
  applicationName: "Kraftwerk",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Kraftwerk" },
};

export const viewport: Viewport = {
  themeColor: "#f4f1e9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

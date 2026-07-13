import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kraftwerk – Ganzkörpertraining",
  description: "Dein offline-fähiger Trainingsbegleiter für Muskelaufbau und die A/B/C-Ganzkörperrotation.",
  applicationName: "Kraftwerk",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Kraftwerk" },
};

export const viewport: Viewport = {
  themeColor: "#0c0e0d",
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

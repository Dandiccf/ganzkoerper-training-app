import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Die Grundidee | Kraftwerk",
  description: "Warum drei Ganzkörpereinheiten mit wechselndem Schwerpunkt eine praktische Struktur für Hypertrophietraining bilden.",
};

export default function ConceptLayout({ children }: { children: React.ReactNode }) {
  return children;
}

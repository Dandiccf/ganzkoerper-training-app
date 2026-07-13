import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kraftwerk – Ganzkörpertraining",
    short_name: "Kraftwerk",
    description: "Offline-fähiges Trainingstagebuch für die A/B/C-Ganzkörperrotation.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1e9",
    theme_color: "#f4f1e9",
    orientation: "portrait-primary",
    icons: [{ src: "/muscle-groups/a-1.png", sizes: "360x360", type: "image/png", purpose: "any" }],
  };
}

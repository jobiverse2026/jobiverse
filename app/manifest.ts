import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JobiVerse - Hiring & Career Platform",
    short_name: "JobiVerse",
    description: "Every Hire. Every Career. One Universe.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    lang: "en-IN",
    dir: "ltr",
    categories: ["business", "productivity", "education"],
    background_color: "#f5f5f3",
    theme_color: "#18181b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}

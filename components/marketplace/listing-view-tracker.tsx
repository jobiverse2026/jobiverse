"use client";

import { useEffect } from "react";

export function ListingViewTracker({ slugs }: { slugs: string[] }) {
  useEffect(() => {
    const unseen = slugs.filter(slug => {
      const key = `jv-service-view:${slug}`;
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, "1");
      return true;
    });
    if (!unseen.length) return;
    void fetch("/api/marketplace/views", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slugs: unseen }), keepalive: true });
  }, [slugs]);
  return null;
}

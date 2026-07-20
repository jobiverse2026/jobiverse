"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackToDashboardButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push(href);
      }}
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white"
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}

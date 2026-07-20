"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const message = encodeURIComponent("Hi JobiVerse, I want to discuss hiring/career services.");

export function WhatsAppLeadCapture() {
  const pathname = usePathname();
  const hide = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/admin") || pathname.startsWith("/recruiter");
  if (hide) return null;

  return (
    <a
      href={`https://wa.me/917738832231?text=${message}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-24 right-5 z-40 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white/95 px-4 py-3 text-sm font-bold text-zinc-950 shadow-2xl shadow-emerald-950/10 backdrop-blur transition hover:-translate-y-1 hover:bg-emerald-50 sm:right-7"
      aria-label="Chat with JobiVerse on WhatsApp"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">
        <MessageCircle size={20} />
      </span>
      <span className="hidden sm:block">Talk to JobiVerse</span>
    </a>
  );
}

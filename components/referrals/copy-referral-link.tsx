"use client";
import { Copy, Share2 } from "lucide-react";
import { useState } from "react";

export function ReferralShareActions({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <div className="flex flex-col gap-2 sm:flex-row"><button type="button" onClick={copy} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 font-semibold text-white"><Copy size={17}/>{copied?"Copied":"Copy link"}</button><a href={`https://wa.me/?text=${encodeURIComponent(`Join JobiVerse: ${value}`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-5 py-3 font-semibold"><Share2 size={17}/>Share</a></div>;
}

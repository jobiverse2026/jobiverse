"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function JoviGuide({ title = "Need a little direction?", message, href, action = "Show me the way", compact = false, dark = false }: { title?: string; message: string; href?: string; action?: string; compact?: boolean; dark?: boolean }) {
  const reduced = useReducedMotion();
  return <section className={`relative overflow-hidden rounded-[2rem] border p-5 ${dark ? "border-white/10 bg-white/[.06] text-white" : "border-violet-100 bg-white text-zinc-950"}`}>
    <div aria-hidden="true" className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />
    <div className={`relative flex ${compact ? "items-center" : "items-start"} gap-4`}>
      <motion.div animate={reduced ? undefined : { y: [0, -7, 0], rotate: [0, 2, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }} className={`${compact ? "h-20 w-20" : "h-28 w-28"} shrink-0`}>
        <Image src="/images/branding/jovi-guide.png" alt="Jovi, the JobiVerse guide" width={256} height={256} className="h-full w-full object-contain drop-shadow-[0_18px_28px_rgba(76,29,149,.28)]" />
      </motion.div>
      <div className="min-w-0 pt-1"><p className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] ${dark ? "text-violet-200" : "text-violet-700"}`}><Sparkles size={13}/> Jovi guide</p><h2 className={`${compact ? "mt-1 text-lg" : "mt-2 text-xl"} font-bold`}>{title}</h2><p className={`mt-2 text-sm leading-6 ${dark ? "text-zinc-300" : "text-zinc-600"}`}>{message}</p>{href && <Link href={href} className={`mt-4 inline-flex items-center gap-2 text-sm font-bold ${dark ? "text-violet-200" : "text-violet-800"}`}>{action}<ArrowRight size={15}/></Link>}</div>
    </div>
  </section>;
}

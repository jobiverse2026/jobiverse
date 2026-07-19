"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f6f3] px-5 pb-12 pt-28 sm:px-8">
      <div className="jv-noise relative mx-auto min-h-[760px] max-w-[1450px] overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,.18),transparent_23rem),linear-gradient(135deg,#09090b,#27272a_58%,#52525b)] p-5 text-white shadow-[0_45px_120px_-45px_rgba(0,0,0,.7)] sm:p-8 lg:p-12">
        <div className="jv-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="pointer-events-none absolute -left-36 -top-36 h-[420px] w-[420px] rounded-full border border-white/10" />
        <div className="relative z-10 grid min-h-[670px] items-center gap-10 lg:grid-cols-[1fr_.72fr]">
          <motion.section initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:.7}} className="hidden px-4 lg:block xl:px-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-200"><Sparkles size={15}/> Secure JobiVerse access</div>
            <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[.95] tracking-[-.055em] xl:text-7xl">Enter one universe. <span className="text-zinc-400">Continue your journey.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-300">Students, professionals, creators, recruiters and employers-every JobiVerse workspace begins here.</p>
            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">{[["01","Choose your role"],["02","Access your workspace"],["03","Keep moving forward"]].map(([number,label])=><div key={number} className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><p className="text-xs font-bold text-zinc-500">{number}</p><p className="mt-3 text-sm font-semibold">{label}</p></div>)}</div>
            <div className="relative mt-14 h-32 max-w-xl"><div className="absolute inset-x-0 top-1/2 border-t border-white/10"/><div className="absolute left-[15%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_24px_white]"/><div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/10"><Sparkles size={23}/></div><div className="absolute right-[12%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-zinc-400"/></div>
          </motion.section>

          <motion.section initial={{opacity:0,y:20,scale:.98}} animate={{opacity:1,y:0,scale:1}} transition={{duration:.6,delay:.15}} className="flex justify-center">
            <div className="w-full max-w-md rounded-[2.5rem] border border-white/60 bg-white/95 p-7 text-zinc-950 shadow-[0_35px_100px_-40px_rgba(0,0,0,.7)] backdrop-blur-2xl sm:p-9"><Suspense fallback={<div className="min-h-96 animate-pulse rounded-3xl bg-zinc-100" aria-label="Loading secure login"/>}>{children}</Suspense></div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

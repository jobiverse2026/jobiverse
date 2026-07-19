"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, GraduationCap, Sparkles } from "lucide-react";

const audiences = [
  { title: "For Employers", text: "Build exceptional teams.", href: "/employers", icon: Building2 },
  { title: "For Professionals", text: "Make your next career move.", href: "/candidates", icon: Briefcase },
  { title: "For Students", text: "Start your journey career-ready.", href: "/students", icon: GraduationCap },
];

export function Hero() {
  return (
    <section className="bg-[#f6f6f3] px-5 pb-10 pt-28 sm:px-8">
      <div className="jv-noise relative mx-auto max-w-[1450px] overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,.18),transparent_23rem),linear-gradient(135deg,#09090b,#27272a_58%,#52525b)] px-7 py-20 text-white shadow-[0_45px_120px_-45px_rgba(0,0,0,.7)] sm:px-14 lg:py-28">
        <div className="jv-grid pointer-events-none absolute inset-0 opacity-10" />
        <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full border border-white/10" />
        <div className="relative z-10 grid items-center gap-16 lg:grid-cols-[1.15fr_.65fr]">
          <div>
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-200 backdrop-blur"><Sparkles size={15}/> India&apos;s Hiring & Career Platform</motion.div>
            <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.1}} className="mt-7 max-w-4xl text-4xl font-semibold leading-[.95] tracking-[-.055em] sm:text-6xl lg:text-7xl">Connecting businesses with talent. <span className="text-zinc-400">Empowering people with careers.</span></motion.h1>
            <motion.p initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.2}} className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300">One intelligent ecosystem for companies building teams, professionals growing careers and students taking their first step.</motion.p>
            <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.3}} className="mt-10 flex flex-wrap gap-3"><Link href="/candidates" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black">Find opportunities <ArrowRight size={18}/></Link><Link href="/employers" className="rounded-2xl border border-white/20 bg-white/5 px-6 py-4 font-semibold">Hire talent</Link></motion.div>
          </div>

          <motion.div initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} transition={{duration:.8,delay:.25}} className="relative mx-auto aspect-square w-full max-w-[410px]">
            <div className="absolute inset-0 rounded-full border border-white/15"/><div className="absolute inset-[13%] rotate-12 rounded-full border border-white/10"/><div className="absolute inset-[28%] rounded-full border border-white/15 bg-white/[.06] backdrop-blur"/><div className="absolute inset-[36%] grid place-items-center rounded-full bg-white text-black shadow-[0_0_80px_rgba(255,255,255,.2)]"><Sparkles size={38}/></div>
            {[["Talent","left-1/2 top-0 -translate-x-1/2"],["Opportunity","-right-7 top-[48%]"],["Growth","bottom-[3%] left-[6%]"]].map(([label,position])=><span key={label} className={`absolute ${position} rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur-xl`}>{label}</span>)}
            <span className="absolute left-[8%] top-[28%] h-3 w-3 rounded-full bg-white shadow-[0_0_22px_white]"/><span className="absolute bottom-[20%] right-[18%] h-2 w-2 rounded-full bg-zinc-300"/>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto mt-5 grid max-w-[1450px] gap-3 md:grid-cols-3">{audiences.map(({title,text,href,icon:Icon})=><Link href={href} key={title} className="group flex items-center gap-4 rounded-[1.5rem] border border-zinc-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"><span className="grid h-11 w-11 place-items-center rounded-xl bg-black text-white"><Icon size={20}/></span><span><strong className="block text-sm">{title}</strong><span className="text-sm text-zinc-500">{text}</span></span><ArrowRight className="ml-auto text-zinc-300 transition group-hover:translate-x-1 group-hover:text-black" size={18}/></Link>)}</div>
    </section>
  );
}

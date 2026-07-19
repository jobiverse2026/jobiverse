"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";


interface PageHeaderProps {
  eyebrow:string;
  title:string;
  description:string;
  afterIndex?:boolean;
}


export function PageHeader({
  eyebrow,
  title,
  description,
  afterIndex = false,
}:PageHeaderProps) {

  const context = `${eyebrow} ${title}`.toLowerCase();
  const orbitLabels = context.includes("service")
    ? ["Search", "Match", "Hire"]
    : context.includes("employer") || context.includes("hiring")
      ? ["Talent", "Teams", "Growth"]
    : context.includes("candidate") || context.includes("career")
      ? ["Skills", "Roles", "Growth"]
      : context.includes("about") || context.includes("future")
          ? ["People", "Purpose", "Future"]
          : ["Discover", "Connect", "Grow"];


  return (

    <section className={`bg-[#f6f6f3] px-5 pb-10 sm:px-8 ${afterIndex ? "pt-4" : "pt-28"}`}>
      <div className="jv-noise relative mx-auto max-w-[1450px] overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,.18),transparent_23rem),linear-gradient(135deg,#09090b,#27272a_58%,#52525b)] px-7 py-20 text-white shadow-[0_45px_120px_-45px_rgba(0,0,0,.65)] sm:px-14 lg:py-28">
      <div aria-hidden="true" className="jv-grid absolute inset-0 opacity-10" />
      <div aria-hidden="true" className="absolute -right-28 -top-28 h-96 w-96 rounded-full border border-white/10" />
      <div aria-hidden="true" className="absolute -right-10 top-10 h-72 w-72 rounded-full border border-white/10" />
      <div className="relative z-10 grid items-center gap-16 lg:grid-cols-[1.15fr_.65fr]">
      <div className="max-w-4xl">


        <motion.p

          initial={{
            opacity:0,
            y:20
          }}

          animate={{
            opacity:1,
            y:0
          }}

          transition={{
            duration:.5
          }}

          className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-200 backdrop-blur"

        >

          {eyebrow}

        </motion.p>



        <motion.h1

          initial={{
            opacity:0,
            y:20
          }}

          animate={{
            opacity:1,
            y:0
          }}

          transition={{
            duration:.6,
            delay:.1
          }}

          className="
          mt-6
          text-4xl
          font-bold
          leading-[.95]
          tracking-[-.055em]
          whitespace-pre-line
          text-white
          sm:text-6xl
          lg:text-7xl
          "

        >

          {title}

        </motion.h1>



        <motion.p

          initial={{
            opacity:0,
            y:20
          }}

          animate={{
            opacity:1,
            y:0
          }}

          transition={{
            duration:.6,
            delay:.2
          }}

          className="
          mt-6
          max-w-2xl
          text-lg
          leading-8
          text-zinc-300
          "

        >

          {description}

        </motion.p>


      </div>

      <motion.div initial={{opacity:0,scale:.92}} animate={{opacity:1,scale:1}} transition={{duration:.7,delay:.25}} className="relative mx-auto hidden aspect-square w-full max-w-[390px] lg:block">
        <div className="absolute inset-0 rounded-full border border-white/15" />
        <div className="absolute inset-[12%] rotate-12 rounded-full border border-white/10" />
        <div className="absolute inset-[27%] -rotate-12 rounded-full border border-white/15 bg-white/[.06] shadow-[0_30px_100px_-20px_rgba(0,0,0,.6)] backdrop-blur-xl" />
        <div className="absolute inset-[35%] grid place-items-center rounded-full bg-white text-zinc-950 shadow-[0_0_70px_rgba(255,255,255,.2)]"><Sparkles size={38}/></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur-xl">{orbitLabels[0]}</div>
        <div className="absolute -right-7 top-[48%] rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur-xl">{orbitLabels[1]}</div>
        <div className="absolute bottom-[4%] left-[4%] rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur-xl">{orbitLabels[2]}</div>
        <div className="absolute left-[8%] top-[28%] h-3 w-3 rounded-full bg-white shadow-[0_0_22px_white]" />
        <div className="absolute bottom-[20%] right-[20%] h-2 w-2 rounded-full bg-zinc-300" />
      </motion.div>
      </div>
      </div>


    </section>

  );

}

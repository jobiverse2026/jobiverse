"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import { useSessionIntro } from "@/components/intro/useSessionIntro";
import ParticleLogo from "@/components/intro/ParticleLogo";

const wordmark = "JOBIVERSE".split("");

export default function IntroAnimation() {
  const { showIntro, completeIntro } = useSessionIntro();

  useEffect(() => {
    if (!showIntro) return;
    const timer = window.setTimeout(completeIntro, 4600);
    return () => window.clearTimeout(timer);
  }, [completeIntro, showIntro]);

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.025, filter: "blur(10px)" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-[#f8f8f7] text-zinc-950"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(161,161,170,.16),transparent_28%),radial-gradient(circle_at_20%_10%,rgba(255,255,255,.95),transparent_32%),linear-gradient(145deg,#ffffff,#eeeeec)]" />
          <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(0,0,0,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.2)_1px,transparent_1px)] [background-size:54px_54px]" />

          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -18 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-[440px] w-[720px] rounded-[50%] border border-zinc-900/10"
          />
          <motion.div
            initial={{ scale: 0.35, opacity: 0, rotate: 22 }}
            animate={{ scale: 1, opacity: 1, rotate: 8 }}
            transition={{ delay: 0.2, duration: 1.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-[320px] w-[620px] rounded-[50%] border border-zinc-900/[0.07]"
          />

          <motion.div
            initial={{ x: "-130%" }}
            animate={{ x: "130%" }}
            transition={{ delay: 0.45, duration: 2.2, ease: "easeInOut" }}
            className="absolute inset-y-0 w-56 rotate-12 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-2xl"
          />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.15, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-32 w-32 items-center justify-center md:h-40 md:w-40"
            >
              <motion.div
                animate={{ opacity: [0.15, 0.45, 0.15], scale: [0.85, 1.25, 0.85] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-2 rounded-full bg-zinc-400/20 blur-3xl"
              />
              <ParticleLogo />
            </motion.div>

            <div className="mt-5 flex overflow-hidden">
              {wordmark.map((letter, index) => (
                <motion.span
                  key={`${letter}-${index}`}
                  initial={{ opacity: 0, y: 42, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.9 + index * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl font-black tracking-[0.12em] md:text-6xl"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.7 }}
              className="mt-5 text-[10px] font-semibold uppercase tracking-[0.34em] text-zinc-600 md:text-xs"
            >
              Every Hire. Every Career. One Universe.
            </motion.p>

            <div className="mt-10 h-px w-64 overflow-hidden bg-zinc-900/10 md:w-80">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ delay: 1.7, duration: 2.15, ease: [0.65, 0, 0.35, 1] }}
                className="h-full w-full bg-gradient-to-r from-zinc-300 via-zinc-950 to-zinc-300"
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.7, duration: 0.6 }}
              className="mt-4 text-[10px] uppercase tracking-[0.28em] text-zinc-500"
            >
              India&apos;s Hiring &amp; Career Platform
            </motion.p>
          </div>

          <button
            type="button"
            onClick={completeIntro}
            className="absolute bottom-7 right-7 z-20 rounded-full border border-zinc-900/10 bg-white/55 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 shadow-sm backdrop-blur transition hover:border-zinc-900/25 hover:text-zinc-950"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

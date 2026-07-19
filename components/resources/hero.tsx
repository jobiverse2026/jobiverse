"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

export function ResourcesHero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-white">

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

      {/* Glow */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-zinc-200 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-28 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            JobiVerse Knowledge Hub
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6 }}
            className="text-5xl font-bold tracking-tight text-black sm:text-7xl"
          >
            Learn.
            <br />
            Hire.
            <span className="text-zinc-500"> Grow.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .3 }}
            className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-600"
          >
            Discover hiring guides, career advice, resume resources,
            industry insights and AI-powered knowledge designed for
            employers, recruiters and professionals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .5 }}
            className="mt-10 flex justify-center"
          >
            <Link
              href="#featured"
              className="group flex items-center gap-2 rounded-xl bg-black px-7 py-4 font-medium text-white transition hover:bg-zinc-800"
            >
              Explore Resources

              <ArrowRight className="transition group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Stats */}

          <div className="mt-20 grid gap-6 sm:grid-cols-3">

            {[
              ["100+", "Resources Coming"],
              ["AI", "Career Tools"],
              ["Free", "Learning Content"],
            ].map(([number, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-lg"
              >
                <BookOpen className="mx-auto mb-4 h-8 w-8 text-black" />

                <div className="text-3xl font-bold">
                  {number}
                </div>

                <div className="mt-2 text-sm text-zinc-500">
                  {label}
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </section>
  );
}
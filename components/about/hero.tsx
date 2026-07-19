"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Users,
  Globe2,
  BriefcaseBusiness,
} from "lucide-react";

const stats = [
  {
    number: "20+",
    label: "Years Combined Experience",
    icon: BriefcaseBusiness,
  },
  {
    number: "35K+",
    label: "Professional Network",
    icon: Users,
  },
  {
    number: "10+",
    label: "Countries Hiring Exposure",
    icon: Globe2,
  },
];

export function AboutHero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-white">

      {/* Grid Background */}

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

      {/* Floating Glow */}

      <motion.div
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-zinc-200 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-28 lg:px-8">

        <div className="mx-auto max-w-5xl text-center">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-600 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            About JobiVerse
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="text-5xl font-bold tracking-tight text-black sm:text-7xl"
          >
            Building Careers.
            <br />

            <span className="text-zinc-500">
              Empowering Businesses.
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.3,
            }}
            className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-600"
          >
            JobiVerse is an emerging recruitment and HR technology company
            committed to connecting exceptional talent with ambitious
            organizations. We combine recruitment expertise, strong
            professional networks and modern technology to create
            smarter hiring experiences.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.5,
            }}
            className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/contact"
              className="group flex items-center justify-center gap-2 rounded-xl bg-black px-7 py-4 font-medium text-white transition hover:bg-zinc-800"
            >
              Let's Connect

              <ArrowRight className="transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="/services"
              className="rounded-xl border border-zinc-300 px-7 py-4 font-medium text-black transition hover:bg-zinc-100"
            >
              Explore Services
            </Link>
          </motion.div>

          {/* Stats */}

          <div className="mt-20 grid gap-6 sm:grid-cols-3">

            {stats.map((item) => {

              const Icon = item.icon;

              return (

                <motion.div
                  key={item.label}
                  whileHover={{
                    y: -8,
                  }}
                  className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-xl"
                >

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">

                    <Icon className="h-7 w-7" />

                  </div>

                  <h3 className="mt-6 text-4xl font-bold">

                    {item.number}

                  </h3>

                  <p className="mt-3 text-zinc-600">

                    {item.label}

                  </p>

                </motion.div>

              );

            })}

          </div>

        </div>

      </div>

    </section>
  );
}
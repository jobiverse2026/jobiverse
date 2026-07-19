"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BriefcaseBusiness, Sparkles } from "lucide-react";

export function Story() {
  return (
    <section className="border-b border-zinc-200 bg-white py-28">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:px-8">

        {/* Left */}

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            OUR STORY
          </p>

          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            Why JobiVerse
            <br />
            Exists.
          </h2>

          <p className="mt-8 text-lg leading-8 text-zinc-600">
            Hiring is one of the biggest challenges for every business,
            while finding the right opportunity remains one of the biggest
            challenges for professionals.
          </p>

          <p className="mt-6 text-lg leading-8 text-zinc-600">
            JobiVerse was created to bridge this gap by combining recruitment
            expertise, technology and trusted relationships into one
            modern hiring ecosystem.
          </p>

          <p className="mt-6 text-lg leading-8 text-zinc-600">
            Today we operate as a recruitment company, but our vision goes
            far beyond placements. We are building a platform where hiring,
            careers and AI work together seamlessly.
          </p>
        </motion.div>

        {/* Right */}

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center"
        >
          <div className="w-full rounded-[32px] border border-zinc-200 bg-zinc-50 p-10">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
              <Sparkles className="h-7 w-7" />
            </div>

            <h3 className="mt-8 text-3xl font-bold">
              Building India's
              <br />
              Hiring Ecosystem
            </h3>

            <p className="mt-6 leading-8 text-zinc-600">
              Our ambition is to evolve JobiVerse into a complete HR
              Technology Platform offering recruitment, AI hiring,
              career services, HR solutions and intelligent tools
              for employers and candidates.
            </p>

            <div className="mt-10 space-y-5">

              <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
                <div>
                  <p className="font-semibold">
                    Recruitment Expertise
                  </p>

                  <p className="text-sm text-zinc-500">
                    20+ years combined experience
                  </p>
                </div>

                <BriefcaseBusiness className="h-6 w-6" />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
                <div>
                  <p className="font-semibold">
                    Future Vision
                  </p>

                  <p className="text-sm text-zinc-500">
                    AI + HR Technology Platform
                  </p>
                </div>

                <ArrowUpRight className="h-6 w-6" />
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
"use client";

import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Users,
  Globe2,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    number: "20+",
    title: "Years of Combined Experience",
    description:
      "Built on decades of recruitment expertise across multiple industries and hiring functions.",
    icon: BriefcaseBusiness,
  },
  {
    number: "35K+",
    title: "Professional Network",
    description:
      "A growing community of professionals, hiring managers and decision makers.",
    icon: Users,
  },
  {
    number: "10+",
    title: "Countries Exposure",
    description:
      "Global hiring experience supporting companies across international markets.",
    icon: Globe2,
  },
];

export function Experience() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50 py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            OUR IMPACT
          </p>

          <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Experience That
            <br />
            Creates Results.
          </h2>

          <p className="mt-6 text-lg leading-8 text-zinc-600">
            Recruitment is not just about filling positions.
            It's about connecting the right people with the right
            opportunities while creating long-term business value.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group rounded-[32px] border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                    <Icon className="h-7 w-7" />
                  </div>

                  <ArrowUpRight className="h-6 w-6 text-zinc-400 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-black" />
                </div>

                <h3 className="mt-10 text-5xl font-bold tracking-tight">
                  {item.number}
                </h3>

                <h4 className="mt-4 text-xl font-semibold">
                  {item.title}
                </h4>

                <p className="mt-4 leading-7 text-zinc-600">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
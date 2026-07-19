"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";

const resources = [
  {
    title: "Hiring Guides",
    description:
      "Best practices, recruitment strategies and hiring frameworks for modern businesses.",
    icon: BriefcaseBusiness,
    href: "/resources/hiring-guides",
    badge: "Employers",
  },
  {
    title: "Resume Resources",
    description:
      "Resume writing tips, ATS optimization and professional profile improvement.",
    icon: FileText,
    href: "/resources/resume",
    badge: "Candidates",
  },
  {
    title: "AI Career Tools",
    description:
      "Explore the future of recruitment with intelligent AI-powered career resources.",
    icon: BrainCircuit,
    href: "/resources/ai",
    badge: "Coming Soon",
  },
  {
    title: "Industry Insights",
    description:
      "Hiring trends, salary reports and market intelligence across industries.",
    icon: TrendingUp,
    href: "/resources/insights",
    badge: "Reports",
  },
];

export function FeaturedResources() {
  return (
    <section
      id="featured"
      className="border-t border-zinc-200 bg-zinc-50 py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Featured Resources
          </p>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-black sm:text-5xl">
            Knowledge Designed
            <br />
            For Growth.
          </h2>

          <p className="mt-6 text-lg text-zinc-600">
            Whether you're hiring talent or building your career,
            explore practical resources created by recruitment experts.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">

          {resources.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link
                  href={item.href}
                  className="group block rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                      <Icon className="h-7 w-7" />
                    </div>

                    <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      {item.badge}
                    </span>

                  </div>

                  <h3 className="mt-8 text-2xl font-semibold text-black">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-7 text-zinc-600">
                    {item.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-black">
                    Explore

                    <ArrowUpRight className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>

                </Link>
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BriefcaseBusiness,
  UserRound,
  BrainCircuit,
  FileDown,
  TrendingUp,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

const categories = [
  {
    title: "For Employers",
    description:
      "Hiring strategies, recruitment guides and HR best practices.",
    icon: BriefcaseBusiness,
    href: "/resources/employers",
    className: "md:col-span-2",
  },

  {
    title: "AI Tools",
    description:
      "Coming Soon",
    icon: BrainCircuit,
    href: "/resources/ai",
    className: "",
  },

  {
    title: "Career Resources",
    description:
      "Resume tips, interview prep and career growth.",
    icon: UserRound,
    href: "/resources/candidates",
    className: "",
  },

  {
    title: "Industry Reports",
    description:
      "Salary guides and hiring insights.",
    icon: TrendingUp,
    href: "/resources/reports",
    className: "md:col-span-2",
  },

  {
    title: "Downloads",
    description:
      "Templates & checklists.",
    icon: FileDown,
    href: "/resources/downloads",
    className: "",
  },

  {
    title: "Blogs",
    description:
      "Latest recruitment articles.",
    icon: BookOpen,
    href: "/resources/blogs",
    className: "",
  },
];

export function Categories() {
  return (
    <section className="border-t border-zinc-200 bg-white py-28">

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Browse
          </p>

          <h2 className="mt-5 text-4xl font-bold sm:text-5xl">
            Explore By Category
          </h2>

          <p className="mt-6 text-lg text-zinc-600">
            Find exactly what you're looking for across employers,
            candidates, AI and industry insights.
          </p>

        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">

          {categories.map((item, index) => {

            const Icon = item.icon;

            return (

              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: .95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * .08 }}
                whileHover={{ y: -8 }}
                className={item.className}
              >

                <Link
                  href={item.href}
                  className="group flex h-full flex-col rounded-3xl border border-zinc-200 bg-zinc-50 p-8 transition hover:bg-white hover:shadow-xl"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">

                      <Icon className="h-7 w-7"/>

                    </div>

                    <ArrowUpRight className="opacity-0 transition group-hover:opacity-100"/>

                  </div>

                  <h3 className="mt-8 text-2xl font-semibold">

                    {item.title}

                  </h3>

                  <p className="mt-4 text-zinc-600 leading-7">

                    {item.description}

                  </p>

                </Link>

              </motion.div>

            )

          })}

        </div>

      </div>

    </section>
  );
}

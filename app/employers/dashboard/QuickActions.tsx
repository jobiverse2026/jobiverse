"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  BriefcaseBusiness,
  Building2,
  ReceiptIndianRupee,
  Store,
} from "lucide-react";

const actions = [
  {
    title: "Create Requirement",
    href: "/employers/requirements/new",
    icon: Plus,
  },
  {
    title: "Browse Candidates",
    href: "/employers/candidates",
    icon: Users,
  },
  {
    title: "My Requirements",
    href: "/employers/requirements",
    icon: BriefcaseBusiness,
  },
  {
    title: "Company Profile",
    href: "/employers/company",
    icon: Building2,
  },
  {
    title: "Employer Services",
    href: "/marketplace?audience=employer",
    icon: Store,
  },
  {
    title: "Billing & Purchases",
    href: "/account/billing",
    icon: ReceiptIndianRupee,
  },
];

export default function QuickActions() {
  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold">
        Quick Actions
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.1,
              }}
              whileHover={{
                y: -8,
              }}
            >
              <Link
                href={item.href}
                className="flex h-44 flex-col justify-between rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg transition hover:shadow-2xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-black via-zinc-800 to-zinc-600 text-white">
                  <Icon size={26} />
                </div>

                <h3 className="text-xl font-semibold">
                  {item.title}
                </h3>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

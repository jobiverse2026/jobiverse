"use client";

import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Users,
  CalendarClock,
  BadgeCheck,
  BadgeIndianRupee,
} from "lucide-react";

export default function StatsCards({ stats: liveStats }: { stats: { activeRequirements: number; candidates: number; interviews: number; positionsClosed: number; activeOffers: number } }) {
  const stats = [
    { title: "Active Requirements", value: liveStats.activeRequirements, subtitle: "Currently active", icon: BriefcaseBusiness },
    { title: "Candidates", value: liveStats.candidates, subtitle: "Shared with you", icon: Users },
    { title: "Interviews", value: liveStats.interviews, subtitle: "Scheduled", icon: CalendarClock },
    { title: "Active Offers", value: liveStats.activeOffers, subtitle: "Offered or accepted", icon: BadgeIndianRupee },
    { title: "Positions Closed", value: liveStats.positionsClosed, subtitle: "Joined or completed", icon: BadgeCheck },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
            }}
            whileHover={{
              y: -8,
            }}
            className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-zinc-950 p-3">
                <Icon className="text-white" size={24} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                LIVE
              </span>
            </div>

            <h3 className="mt-6 text-sm text-zinc-500">
              {item.title}
            </h3>

            <p className="mt-2 text-4xl font-bold">
              {item.value}
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              {item.subtitle}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

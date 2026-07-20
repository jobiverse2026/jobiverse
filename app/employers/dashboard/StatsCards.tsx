"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Users,
  CalendarClock,
  BadgeCheck,
  BadgeIndianRupee,
  Globe2,
  ShieldCheck,
  UserPlus,
  UserRoundCog,
} from "lucide-react";

export default function StatsCards({ stats: liveStats }: { stats: { activeRequirements: number; candidates: number; interviews: number; positionsClosed: number; activeOffers: number; publishedJobs: number; jobiverseAssigned: number; externalApplicants: number; seatLimit: number; seatsUsed: number; seatsLeft: number; employerSeatLimit?: number; employerSeatsUsed?: number; employerSeatsLeft?: number; recruiterSeatLimit?: number; recruiterSeatsUsed?: number; recruiterSeatsLeft?: number } }) {
  const stats = [
    { title: "Active Requirements", value: liveStats.activeRequirements, subtitle: "Currently active", icon: BriefcaseBusiness, href: "/employers/requirements" },
    { title: "JobiVerse Candidates", value: liveStats.candidates, subtitle: "Profiles shared with you", icon: Users, href: "/employers/candidates?source=jobiverse" },
    { title: "Jobs Portal Live", value: liveStats.publishedJobs, subtitle: "Visible to candidates", icon: Globe2, href: "/employers/requirements" },
    { title: "JobiVerse Assigned", value: liveStats.jobiverseAssigned, subtitle: "Handled by our hiring team", icon: ShieldCheck, href: "/employers/requirements" },
    { title: "External Applicants", value: liveStats.externalApplicants, subtitle: "Direct applications", icon: UserPlus, href: "/employers/external-applicants" },
    { title: "Interviews", value: liveStats.interviews, subtitle: "Scheduled", icon: CalendarClock, href: "/employers/candidates?status=Interview" },
    { title: "Active Offers", value: liveStats.activeOffers, subtitle: "Offered or accepted", icon: BadgeIndianRupee, href: "/employers/candidates?status=Offered" },
    { title: "Positions Closed", value: liveStats.positionsClosed, subtitle: "Joined or completed", icon: BadgeCheck, href: "/employers/candidates?status=Joined" },
    { title: "Employer Seats", value: liveStats.employerSeatsUsed ?? 0, subtitle: `${liveStats.employerSeatsLeft ?? 0} left of ${liveStats.employerSeatLimit ?? 0}`, icon: UserRoundCog, href: "/employers/team" },
    { title: "Recruiter Seats", value: liveStats.recruiterSeatsUsed ?? liveStats.seatsUsed, subtitle: `${liveStats.recruiterSeatsLeft ?? liveStats.seatsLeft} left of ${liveStats.recruiterSeatLimit ?? liveStats.seatLimit}`, icon: UserPlus, href: "/employers/team" },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
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
          >
            <Link href={item.href} className="group block rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition hover:border-zinc-300 hover:bg-white hover:shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-zinc-950 p-3 transition group-hover:scale-105">
                  <Icon className="text-white" size={24} />
                </div>

                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  OPEN
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
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Building2,
  Users,
  BarChart3,
  Settings,
  ReceiptIndianRupee,
  Store,
  Landmark,
  BadgeIndianRupee,
  RotateCcw,
  Flag,
  Headphones,
  FileCheck2,
  Mail,
  ShieldCheck,
  CalendarClock,
  TrendingUp,
  FileLock2,
  GraduationCap,
  BadgeCheck,
  CalendarDays,
  Award,
  Bot,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "JobiVerse Queue",
    href: "/admin/requirements",
    icon: BriefcaseBusiness,
  },
  {
    title: "Companies",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    title: "JobiVerse Candidates",
    href: "/admin/candidates",
    icon: Users,
  },
  {
    title: "Company Reports",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Protection Audit",
    href: "/admin/protection-audit",
    icon: ShieldCheck,
  },
  {
    title: "Billing",
    href: "/admin/billing",
    icon: ReceiptIndianRupee,
  },
  {
    title: "Growth Analytics",
    href: "/admin/growth",
    icon: TrendingUp,
  },
  {
    title: "Campus Partnerships",
    href: "/admin/campus",
    icon: GraduationCap,
  },
  {
    title: "Memberships & Plans",
    href: "/admin/memberships",
    icon: BadgeCheck,
  },
  {
    title: "Events & Workshops",
    href: "/admin/events",
    icon: CalendarDays,
  },
  {
    title: "Credential Verification",
    href: "/admin/credentials",
    icon: Award,
  },
  {
    title: "AI Governance",
    href: "/admin/ai-governance",
    icon: Bot,
  },
  {
    title: "Marketplace Control",
    href: "/admin/marketplace",
    icon: Store,
  },
  {
    title: "CV Templates",
    href: "/admin/templates",
    icon: FileCheck2,
  },
  {
    title: "Finance & Payouts",
    href: "/admin/finance",
    icon: Landmark,
  },
  {
    title: "Payout Accounts",
    href: "/admin/payout-accounts",
    icon: BadgeIndianRupee,
  },
  {
    title: "Refund Center",
    href: "/admin/refunds",
    icon: RotateCcw,
  },
  {
    title: "Message Safety",
    href: "/admin/message-reports",
    icon: Flag,
  },
  {
    title: "Trust & Safety",
    href: "/admin/trust-safety",
    icon: ShieldCheck,
  },
  {
    title: "Consultations",
    href: "/admin/consultations",
    icon: CalendarClock,
  },
  {
    title: "Support Inbox",
    href: "/admin/support",
    icon: Headphones,
  },
  {
    title: "Privacy Requests",
    href: "/admin/privacy-requests",
    icon: FileLock2,
  },
  {
    title: "Email Delivery",
    href: "/admin/email-delivery",
    icon: Mail,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [counts,setCounts]=useState<Record<string,number>>({});
  useEffect(()=>{let active=true;fetch("/api/admin/pending-counts").then(response=>response.json()).then(data=>{if(active)setCounts(data)}).catch(()=>{});return()=>{active=false}},[pathname]);

  return (
    <aside
      className={`
      fixed
      left-0
      top-0
      z-[60]
      flex
      h-screen
      w-[min(86vw,270px)]
      flex-col
      border-r
      border-zinc-200
      bg-white
      shadow-2xl
      transition-transform
      duration-300
      lg:w-[270px]
      lg:translate-x-0
      lg:shadow-none
      ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Logo */}

      <div className="border-b border-zinc-200 px-8 py-7">
        <Logo />
      </div>

      {/* Navigation */}

      <nav className="min-h-0 flex-1 overflow-y-auto px-5 py-4">

        <div className="space-y-2">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className={cn(
                  `
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  px-5
                  py-3
                  text-[15px]
                  font-medium
                  transition-all
                  duration-200
                  `,
                  active
                    ? "bg-black text-white shadow-lg"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
                )}
              >
                <Icon className="h-5 w-5" />

                <span className="flex-1">{item.title}</span>
                {Object.hasOwn(counts,item.href)&&<span className={`grid h-6 min-w-6 place-items-center rounded-full px-1 text-[10px] font-bold ${counts[item.href]>0?"bg-red-600 text-white":"bg-zinc-200 text-zinc-500"}`}>{counts[item.href]>99?"99+":counts[item.href]}</span>}
              </Link>
            );
          })}

        </div>

      </nav>

      {/* Footer */}

      <div
        className="
        border-t
        border-zinc-200
        px-6
        py-6
        "
      >
        <div
          className="
          rounded-2xl
          bg-zinc-100
          p-5
          "
        >
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            JobiVerse
          </p>

          <h3 className="mt-2 font-semibold">
            Recruitment Platform
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Bridging Businesses With Talent,
            Empowering People With Careers.
          </p>
        </div>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  LockKeyhole,
  Users,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    href: "/recruiter",
    icon: LayoutDashboard,
  },
  {
    name: "My Requirements",
    href: "/recruiter/requirements",
    icon: BriefcaseBusiness,
  },
  {
    name: "Candidates",
    href: "/recruiter/candidates",
    icon: Users,
  },
  {
    name: "Talent Search",
    href: "/recruiter/talent-search",
    icon: LockKeyhole,
  },
  {
    name: "Reports",
    href: "/recruiter/reports",
    icon: FileText,
  },
];

export default function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [showTalentSearch, setShowTalentSearch] = useState(false);
  const visibleMenu = useMemo(
    () => menu.filter((item) => item.href !== "/recruiter/talent-search" || showTalentSearch || pathname.startsWith("/recruiter/talent-search")),
    [pathname, showTalentSearch]
  );

  useEffect(() => {
    let active = true;
    fetch("/api/recruiter/talent-search-access", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { allowed: false })
      .then((data) => {
        if (active) setShowTalentSearch(Boolean(data?.allowed));
      })
      .catch(() => {
        if (active) setShowTalentSearch(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <aside
      className={`
      fixed bottom-0 left-0 top-24 z-[60]
      w-[min(86vw,18rem)]
      border-r
      border-zinc-200
      bg-white
      p-6
      shadow-2xl
      transition-transform duration-300
      sm:top-28
      lg:w-72 lg:translate-x-0 lg:shadow-none
      ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <h1 className="text-3xl font-bold">
        JobiVerse
      </h1>

      <p className="mt-1 text-sm text-zinc-500">
        Recruiter Portal
      </p>

      <nav className="mt-10 space-y-2">
        {visibleMenu.map((item) => {
          const Icon = item.icon;

          const active = pathname === item.href || (item.href !== "/recruiter" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                transition
                ${
                  active
                    ? "bg-black text-white"
                    : "hover:bg-zinc-100"
                }
              `}
            >
              <Icon className="h-5 w-5" />

              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

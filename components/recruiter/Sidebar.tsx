"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        {menu.map((item) => {
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

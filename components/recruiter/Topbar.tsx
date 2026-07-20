"use client";

import Link from "next/link";
import { FileText, Menu } from "lucide-react";
import UserMenu from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useUser } from "@/hooks/useUser";

export default function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { user } = useUser();
  return <header className="flex min-h-20 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onMenu} aria-label="Open recruiter navigation" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-2xl border border-zinc-200 bg-white transition hover:bg-zinc-100 lg:hidden"><Menu size={20}/></button><div className="min-w-0"><h2 className="truncate text-lg font-bold sm:text-xl">Recruiter Workspace</h2><p className="hidden text-sm text-zinc-500 sm:block">Hiring operations and candidate delivery</p></div></div><div className="flex shrink-0 items-center gap-2">{user&&<NotificationBell userId={user.id}/>}<Link href="/recruiter/reports" className="hidden items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 sm:inline-flex"><FileText size={15}/>Reports</Link><Link href="/recruiter/requirements" className="rounded-xl bg-zinc-950 px-3 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md sm:px-5 sm:text-sm">Assigned roles</Link><UserMenu/></div></header>;
}

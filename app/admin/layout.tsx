import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { BellRing, TrendingUp, UserCog } from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { requireRole } from "@/lib/auth/authorization";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  try { await requireRole(["admin"]); } catch { redirect("/login/admin?access=denied"); }
  return <AdminShell><div className="space-y-5"><nav className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"><QuickLink href="/admin/users" label="User Management" icon={UserCog}/><QuickLink href="/admin/registration-tracker" label="Registration Tracker Pro" icon={TrendingUp}/><QuickLink href="/admin/alerts" label="Admin Alerts" icon={BellRing}/></nav>{children}</div></AdminShell>;
}

function QuickLink({href,label,icon:Icon}:{href:string;label:string;icon:typeof UserCog}){return <Link href={href} className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-950 hover:text-white"><Icon size={14}/>{label}</Link>}

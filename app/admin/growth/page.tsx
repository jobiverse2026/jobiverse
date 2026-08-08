import {
  ArrowDown,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Store,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const roleNames: Record<string, string> = {
  candidate: "Candidates",
  employer: "Employers",
  recruiter: "Recruiters",
  creator: "Creators",
  admin: "Admins",
};

const roleStyles: Record<string, string> = {
  candidate: "bg-blue-500",
  employer: "bg-violet-500",
  recruiter: "bg-amber-500",
  creator: "bg-emerald-500",
  admin: "bg-zinc-800",
};

export default async function RegistrationTrackerPage() {
  await requireRole(["admin"]);

  const [authUsers, profilesResult, companiesResult, requirementsResult, applicationsResult, servicesResult, ordersResult] = await Promise.all([
    listAllAuthUsers(),
    adminSupabase.from("users").select("id,email,full_name,role,created_at"),
    adminSupabase.from("companies").select("id", { count: "exact", head: true }),
    adminSupabase.from("requirements").select("id,status", { count: "exact" }),
    adminSupabase.from("candidate_applications").select("id,status", { count: "exact" }),
    adminSupabase.from("marketplace_services").select("id,status", { count: "exact" }),
    adminSupabase.from("marketplace_orders").select("id,status", { count: "exact" }),
  ]);

  if (profilesResult.error) throw new Error(profilesResult.error.message);

  const profiles = profilesResult.data ?? [];
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const registrations = authUsers.map((user) => {
    const profile = profileById.get(user.id);
    const metadataRole = typeof user.user_metadata?.role === "string" ? user.user_metadata.role : undefined;
    return {
      id: user.id,
      email: user.email ?? profile?.email ?? "Email unavailable",
      fullName: profile?.full_name || (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null),
      role: profile?.role ?? metadataRole ?? "unassigned",
      createdAt: user.created_at,
      verified: Boolean(user.email_confirmed_at),
    };
  });

  const now = new Date();
  const startOfToday = startOfIstDay(now);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const verified = registrations.filter((user) => user.verified).length;
  const pendingVerification = registrations.length - verified;
  const recentRegistrations = [...registrations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  const roles = ["candidate", "employer", "recruiter", "creator", "admin"].map((role) => ({
    role,
    label: roleNames[role],
    value: registrations.filter((user) => user.role === role).length,
  }));
  const largestRole = Math.max(1, ...roles.map((item) => item.value));

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfToday);
    date.setDate(date.getDate() - (6 - index));
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return {
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      value: registrations.filter((user) => {
        const created = new Date(user.createdAt);
        return created >= date && created < next;
      }).length,
    };
  });
  const peakDay = Math.max(1, ...days.map((day) => day.value));

  const requirements = requirementsResult.data ?? [];
  const applications = applicationsResult.data ?? [];
  const services = servicesResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const funnels = [
    {
      title: "Employer activation",
      steps: [
        ["Employer accounts", roles.find((item) => item.role === "employer")?.value ?? 0],
        ["Company workspaces", companiesResult.count ?? 0],
        ["Requirements created", requirementsResult.count ?? requirements.length],
      ],
    },
    {
      title: "Candidate activation",
      steps: [
        ["Candidate accounts", roles.find((item) => item.role === "candidate")?.value ?? 0],
        ["Applications submitted", applicationsResult.count ?? applications.length],
        ["Applications progressed", applications.filter((item) => !["applied", "withdrawn", "rejected"].includes(item.status)).length],
      ],
    },
    {
      title: "Creator activation",
      steps: [
        ["Creator accounts", roles.find((item) => item.role === "creator")?.value ?? 0],
        ["Published services", services.filter((item) => item.status === "published").length],
        ["Paid / active orders", orders.filter((item) => !["pending_payment", "cancelled"].includes(item.status)).length],
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950 p-9 text-white shadow-2xl sm:p-12">
        <BarChart3 />
        <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-violet-300">Live platform intelligence</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Registration & Activity Tracker</h1>
        <p className="mt-4 max-w-3xl text-zinc-300">Track who registered, which universe they joined, verification health and whether registrations are turning into real platform activity.</p>
        <p className="mt-6 text-xs text-zinc-500">Updated {now.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Total registrations" value={registrations.length} note="All signup accounts" icon={UsersRound} />
        <Metric label="Registered today" value={registrations.filter((user) => new Date(user.createdAt) >= startOfToday).length} note="Since 12:00 AM IST" icon={TrendingUp} />
        <Metric label="Last 7 days" value={registrations.filter((user) => new Date(user.createdAt) >= sevenDaysAgo).length} note="Rolling seven days" icon={Clock3} />
        <Metric label="Last 30 days" value={registrations.filter((user) => new Date(user.createdAt) >= thirtyDaysAgo).length} note="Rolling thirty days" icon={UserRoundCheck} />
        <Metric label="Pending verification" value={pendingVerification} note={`${verified} email verified`} icon={BadgeCheck} attention={pendingVerification > 0} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <Panel title="Registrations by universe" subtitle="Role selected during signup or assigned by the platform.">
          <div className="space-y-5">
            {roles.map((item) => (
              <div key={item.role}>
                <div className="flex items-center justify-between text-sm"><span className="font-semibold">{item.label}</span><span className="font-bold">{item.value}</span></div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-100"><div className={`h-full rounded-full ${roleStyles[item.role]}`} style={{ width: `${Math.max(item.value ? 8 : 0, (item.value / largestRole) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Registration trend · 7 days" subtitle="Daily new accounts from live authentication records.">
          <div className="flex h-64 items-end gap-3 pt-6">
            {days.map((day) => (
              <div key={day.date} className="flex h-full flex-1 flex-col justify-end text-center">
                <span className="mb-2 text-sm font-bold">{day.value}</span>
                <div className="min-h-1 rounded-t-xl bg-violet-600" style={{ height: `${Math.max(day.value ? 12 : 3, (day.value / peakDay) * 100)}%` }} />
                <span className="mt-3 text-xs font-semibold text-zinc-600">{day.label}</span>
                <span className="mt-1 text-[10px] text-zinc-400">{day.date}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {funnels.map((funnel) => (
          <Panel key={funnel.title} title={funnel.title} subtitle="Registration to meaningful activity.">
            <div className="space-y-2">
              {funnel.steps.map(([label, value], index) => (
                <div key={String(label)}>{index > 0 && <ArrowDown className="mx-auto my-2 text-zinc-300" size={16} />}<div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-5 py-4"><span className="text-sm font-semibold">{label}</span><span className="text-2xl font-bold">{value}</span></div></div>
              ))}
            </div>
          </Panel>
        ))}
      </section>

      <Panel title="Latest registrations" subtitle="The 12 newest accounts, including email verification status.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead><tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-400"><th className="px-3 py-4">Member</th><th className="px-3 py-4">Universe</th><th className="px-3 py-4">Registered</th><th className="px-3 py-4">Email status</th></tr></thead>
            <tbody>{recentRegistrations.map((user) => <tr key={user.id} className="border-b border-zinc-100 last:border-0"><td className="px-3 py-4"><p className="font-semibold">{user.fullName || "Name not added"}</p><p className="mt-1 text-xs text-zinc-500">{user.email}</p></td><td className="px-3 py-4"><RolePill role={user.role} /></td><td className="px-3 py-4 text-zinc-500">{new Date(user.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</td><td className="px-3 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{user.verified ? "Verified" : "Pending"}</span></td></tr>)}</tbody>
          </table>
        </div>
      </Panel>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SmallMetric label="Companies" value={companiesResult.count ?? 0} icon={Building2} />
        <SmallMetric label="Requirements" value={requirementsResult.count ?? requirements.length} icon={BriefcaseBusiness} />
        <SmallMetric label="Applications" value={applicationsResult.count ?? applications.length} icon={UsersRound} />
        <SmallMetric label="Marketplace services" value={servicesResult.count ?? services.length} icon={Store} />
      </section>
    </div>
  );
}

async function listAllAuthUsers() {
  const users: User[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return users;
}

function startOfIstDay(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return new Date(Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day)) - 5.5 * 60 * 60 * 1000);
}

function Metric({ label, value, note, icon: Icon, attention = false }: { label: string; value: number; note: string; icon: typeof UsersRound; attention?: boolean }) {
  return <article className={`rounded-3xl border p-6 shadow-sm ${attention ? "border-amber-200 bg-amber-50" : "border-zinc-200 bg-white"}`}><Icon className={attention ? "text-amber-700" : "text-zinc-400"} /><p className="mt-5 text-sm text-zinc-500">{label}</p><p className="mt-2 text-4xl font-bold tracking-[-.04em]">{value}</p><p className="mt-2 text-xs text-zinc-400">{note}</p></article>;
}

function SmallMetric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof UsersRound }) {
  return <article className="flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={19} /></span><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-zinc-500">{label}</p></div></article>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm"><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-zinc-500">{subtitle}</p><div className="mt-6">{children}</div></section>;
}

function RolePill({ role }: { role: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold capitalize"><span className={`h-2 w-2 rounded-full ${roleStyles[role] ?? "bg-zinc-400"}`} />{roleNames[role] ?? role.replaceAll("_", " ")}</span>;
}

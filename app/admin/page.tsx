import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Headphones,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Users,
  Siren,
  WalletCards,
} from "lucide-react";

import { getDashboardData } from "@/actions/admin";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default async function AdminDashboardPage() {
  const { stats, latestRequirements, latestOrders, leakageWatchlist } = await getDashboardData();

  const overview = [
    {
      title: "Company reports",
      value: stats.companies,
      note: `${stats.employers} employer accounts | ${stats.verifiedCompanies} verified`,
      href: "/admin/analytics",
      icon: Users,
    },
    {
      title: "Companies",
      value: stats.companies,
      note: `${stats.verifiedCompanies} verified companies`,
      href: "/admin/companies",
      icon: Building2,
    },
    {
      title: "JobiVerse queue",
      value: stats.openRequirements,
      note: `${stats.jobiverseRequirements} assigned requirements`,
      href: "/admin/requirements",
      icon: BriefcaseBusiness,
    },
    {
      title: "Active orders",
      value: stats.activeOrders,
      note: "Marketplace work in motion",
      href: "/admin/marketplace",
      icon: PackageCheck,
    },
  ];

  const queues = [
    {
      title: "Marketplace moderation",
      value: stats.pendingServices,
      text: "Creator services waiting for review.",
      href: "/admin/marketplace",
      icon: ShieldCheck,
    },
    {
      title: "Refund centre",
      value: stats.pendingRefunds,
      text: "Refund requests needing admin action.",
      href: "/admin/refunds",
      icon: WalletCards,
    },
    {
      title: "Payout accounts",
      value: stats.pendingPayoutAccounts,
      text: "Creator bank accounts pending verification.",
      href: "/admin/finance",
      icon: Sparkles,
    },
    {
      title: "Support inbox",
      value: stats.unreadSupport,
      text: "Conversations with unread admin messages.",
      href: "/messages",
      icon: Headphones,
    },
  ];
  const launchControl = [
    { title: "JobiVerse hiring queue", value: stats.jobiverseRequirements, note: "Assigned requirements to work", href: "/admin/requirements", icon: BriefcaseBusiness },
    { title: "Candidate intelligence", value: stats.candidates, note: "Profiles tracked inside hiring ops", href: "/admin/candidates", icon: Users },
    { title: "External applicants", value: stats.externalApplicants, note: "Direct job portal applicants to monitor", href: "/admin/candidates?source=external", icon: Sparkles },
    { title: "Revenue operations", value: stats.activeOrders + stats.pendingRefunds + stats.pendingPayoutAccounts, note: "Orders, refunds and payouts needing control", href: "/admin/finance", icon: WalletCards },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">
          JobiVerse admin
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.045em] sm:text-6xl">
          Company Reports Centre
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
          Monitor company-level reports, JobiVerse-assigned hiring queues, marketplace quality, payments, support and growth from one live workspace.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {overview.map((item) => (
          <AdminMetric key={item.title} {...item} />
        ))}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">
              Priority queue
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">
              What needs admin attention.
            </h2>
          </div>
          <Link href="/admin/marketplace" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold">
            Open operations <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {queues.map((item) => (
            <QueueCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-zinc-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Launch control dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">Daily operating cockpit.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">Use this as the founder/admin morning view before checking individual modules.</p>
          </div>
          <Link href="/admin/analytics" className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">
            Company reports <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {launchControl.map((item) => <QueueCard key={item.title} title={item.title} value={item.value} text={item.note} href={item.href} icon={item.icon} />)}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Latest JobiVerse assigned requirements" subtitle="Newest hiring mandates where the employer requested JobiVerse hiring support.">
          {latestRequirements.length ? (
            latestRequirements.map((item: any) => (
              <Row
                key={item.id}
                title={item.job_title}
                meta={`${item.companies?.company_name ?? "Company"} | ${item.companies?.location ?? "Location not added"}`}
                status={item.status}
                href="/admin/requirements"
              />
            ))
          ) : (
            <Empty text="No JobiVerse assigned requirements yet." />
          )}
        </Panel>

        <Panel title="Revenue leakage watchlist" subtitle="JobiVerse-introduced candidates where status movement needs commercial tracking.">
          {leakageWatchlist.length ? (
            leakageWatchlist.map((item: any) => {
              const requirement = Array.isArray(item.requirements) ? item.requirements[0] : item.requirements;
              const company = Array.isArray(requirement?.companies) ? requirement.companies[0] : requirement?.companies;
              return (
                <Row
                  key={item.id}
                  title={item.full_name ?? "JobiVerse candidate"}
                  meta={`${requirement?.job_title ?? "Requirement"} | ${company?.company_name ?? "Company"} | Introduced ${new Date(item.created_at).toLocaleDateString("en-IN")}`}
                  status={item.status ?? "active"}
                  href={`/admin/candidates?q=${encodeURIComponent(item.full_name ?? "")}`}
                />
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-8 text-center text-sm text-emerald-700">
              <Siren className="mx-auto mb-3" size={20} />
              No active leakage signals right now.
            </div>
          )}
        </Panel>

        <Panel title="Latest marketplace orders" subtitle="Newest customer bookings and paid service activity.">
          {latestOrders.length ? (
            latestOrders.map((item: any) => (
              <Row
                key={item.id}
                title={item.service_title ?? "Marketplace service"}
                meta={`${money.format(Number(item.amount ?? 0))} | ${new Date(item.created_at).toLocaleDateString("en-IN")}`}
                status={item.status?.replaceAll("_", " ") ?? "new"}
                href={`/marketplace/orders/${item.id}`}
              />
            ))
          ) : (
            <Empty text="No marketplace orders yet." />
          )}
        </Panel>
      </section>
    </div>
  );
}

function AdminMetric({
  title,
  value,
  note,
  href,
  icon: Icon,
}: {
  title: string;
  value: number;
  note: string;
  href: string;
  icon: ElementType;
}) {
  return (
    <Link href={href} className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white">
          <Icon size={22} />
        </span>
        <ArrowRight className="text-zinc-400 transition group-hover:translate-x-1" size={18} />
      </div>
      <p className="mt-6 text-4xl font-bold tracking-[-.04em]">{value}</p>
      <h2 className="mt-2 font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{note}</p>
    </Link>
  );
}

function QueueCard({
  title,
  value,
  text,
  href,
  icon: Icon,
}: {
  title: string;
  value: number;
  text: string;
  href: string;
  icon: ElementType;
}) {
  const active = value > 0;
  return (
    <Link href={href} className={`rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${active ? "border-amber-200 bg-amber-50" : "border-zinc-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-3">
        <Icon className={active ? "text-amber-700" : "text-zinc-400"} />
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-amber-200 text-amber-900" : "bg-zinc-100 text-zinc-500"}`}>
          {value}
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </Link>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      <div className="mt-6 space-y-3">{children}</div>
    </section>
  );
}

function Row({ title, meta, status, href }: { title: string; meta: string; status: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition hover:bg-zinc-100">
      <div className="min-w-0">
        <p className="truncate font-semibold">{title}</p>
        <p className="mt-1 truncate text-xs text-zinc-500">{meta}</p>
      </div>
      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-zinc-600">
        {status}
      </span>
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">{text}</p>;
}

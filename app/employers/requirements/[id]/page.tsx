import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  GraduationCap,
  MapPin,
  Users,
  WalletCards,
} from "lucide-react";

import { getRequirement } from "@/actions/requirements";

export default async function EmployerRequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const requirement = await getRequirement(id);

  const details = [
    { label: "Department", value: requirement.department, icon: Building2 },
    { label: "Location", value: requirement.location, icon: MapPin },
    { label: "Experience", value: requirement.experience, icon: BriefcaseBusiness },
    { label: "Vacancies", value: requirement.vacancies, icon: Users },
    { label: "Budget CTC", value: requirement.budget_ctc, icon: WalletCards },
    { label: "Notice period", value: requirement.notice_period, icon: Clock3 },
    { label: "Education", value: requirement.education, icon: GraduationCap },
    { label: "Work mode", value: requirement.work_mode, icon: Building2 },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,white,transparent_28%),radial-gradient(circle_at_90%_20%,rgba(99,102,241,.12),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/employers/requirements" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-xl transition hover:-translate-x-1">
            <ArrowLeft size={16} /> All requirements
          </Link>
          <Link href="/employers/dashboard" className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">
            Employer Dashboard
          </Link>
        </div>

        <section className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.65)] sm:p-12">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-zinc-200">{requirement.status}</span>
                <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-violet-200">{requirement.priority} priority</span>
              </div>
              <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{requirement.job_title}</h1>
              <p className="mt-5 text-zinc-400">Hiring mandate #{requirement.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <CalendarDays size={17} /> Created {new Date(requirement.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-[2.25rem] border border-white bg-white/90 p-7 shadow-[0_30px_80px_-50px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Role overview</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Job description</h2>
            <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-zinc-600">
              {requirement.job_description || "Job description will be finalized with your assigned recruiter."}
            </div>

            <div className="mt-10 border-t border-zinc-100 pt-9">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Core skills</p>
              <p className="mt-4 rounded-2xl bg-zinc-50 p-5 leading-7 text-zinc-700">{requirement.primary_skills || "Skills to be confirmed"}</p>
            </div>
          </section>

          <aside className="rounded-[2.25rem] border border-white bg-white/85 p-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,.45)] backdrop-blur-xl">
            <p className="px-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Hiring brief</p>
            <div className="mt-5 space-y-2">
              {details.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex gap-4 rounded-2xl p-4 transition hover:bg-zinc-50">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-white"><Icon size={18} /></span>
                  <div><p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p><p className="mt-1 font-semibold text-zinc-800">{value || "Not specified"}</p></div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

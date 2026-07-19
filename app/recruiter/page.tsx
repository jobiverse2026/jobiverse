import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  CircleCheckBig,
  Clock3,
  UserRoundCheck,
  UsersRound,
  XCircle,
} from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";

export default async function RecruiterDashboard() {
  const { supabase, user, profile } = await requireRole(["recruiter"]);
  const [{ data: requirements }, { data: candidates }] = await Promise.all([
    supabase
      .from("requirements")
      .select("id,job_title,department,status,priority,created_at")
      .eq("assigned_recruiter", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("candidates")
      .select("id,full_name,primary_skills,status,requirement_id,created_at")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const candidateIds = (candidates ?? []).map((item) => item.id);
  const [{ data: interviews }, { data: placements }] = candidateIds.length
    ? await Promise.all([
        supabase.from("interviews").select("id,candidate_id,status,interview_date").in("candidate_id", candidateIds),
        supabase.from("placements").select("id,candidate_id,status").in("candidate_id", candidateIds),
      ])
    : [{ data: [] }, { data: [] }];

  const rows = candidates ?? [];
  const metrics = [
    ["Assigned roles", requirements?.length ?? 0, "Your active workload", BriefcaseBusiness, "/recruiter/requirements"],
    ["Candidates", rows.length, "Profiles managed by you", UsersRound, "/recruiter/candidates"],
    ["Live interviews", (interviews ?? []).filter((item) => ["scheduled", "rescheduled"].includes(normalize(item.status))).length, "Scheduled or rescheduled", CalendarCheck, "/recruiter/candidates?stage=interview"],
    ["Active offers", (placements ?? []).filter((item) => ["offered", "accepted"].includes(normalize(item.status))).length, "Offer stage", CircleCheckBig, "/recruiter/candidates?stage=offered"],
    ["Joined", (placements ?? []).filter((item) => ["joined", "completed"].includes(normalize(item.status))).length, "Successful placements", UserRoundCheck, "/recruiter/candidates?stage=joined"],
    ["Pending action", rows.filter((item) => ["submitted", "screening", "client submitted"].includes(normalize(item.status))).length, "Needs pipeline movement", Clock3, "/recruiter/candidates"],
  ] as const;
  const requirementTitles = new Map((requirements ?? []).map((item) => [item.id, item.job_title]));
  const stages = ["Submitted", "Screening", "Client Submitted", "Interview", "Selected", "Offered", "Joined", "Rejected"];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-9 text-white sm:p-11">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <p className="text-xs font-bold uppercase tracking-[.22em] text-zinc-500">Recruiter command center</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Welcome, {profile.full_name ?? "Recruiter"}.</h1>
        <p className="mt-4 max-w-2xl text-zinc-400">Move assigned roles from sourcing to successful joining with a clear, real-time pipeline.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/recruiter/requirements" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950">
            Open requirements <ArrowRight size={15} />
          </Link>
          <Link href="/recruiter/candidates" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold">
            Candidate pipeline
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([label, value, detail, Icon, href]) => (
          <Link key={label} href={href} className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white">
              <Icon size={19} />
            </span>
            <p className="mt-5 text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
              {detail}
              <ArrowRight size={13} className="transition group-hover:translate-x-1" />
            </p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent candidates</h2>
            <Link href="/recruiter/candidates" className="text-sm font-semibold text-zinc-600">View all</Link>
          </div>
          <div className="mt-6 space-y-3">
            {rows.slice(0, 6).length ? rows.slice(0, 6).map((candidate) => (
              <Link key={candidate.id} href={`/recruiter/candidates/${candidate.id}`} className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4 transition hover:bg-zinc-100">
                <div className="min-w-0">
                  <p className="truncate font-bold">{candidate.full_name}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">{requirementTitles.get(candidate.requirement_id) ?? "Assigned requirement"} | {candidate.primary_skills ?? "Skills pending"}</p>
                </div>
                <Stage status={candidate.status} />
              </Link>
            )) : <Empty text="No candidates added yet." />}
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-7">
          <h2 className="text-2xl font-bold">Pipeline health</h2>
          <div className="mt-6 space-y-4">
            {stages.map((stage) => {
              const value = rows.filter((item) => normalize(item.status) === normalize(stage)).length;
              const max = Math.max(1, ...stages.map((name) => rows.filter((item) => normalize(item.status) === normalize(name)).length));
              return (
                <div key={stage}>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{stage}</span>
                    <span>{value}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className={`h-full rounded-full ${stage === "Rejected" ? "bg-red-500" : "bg-zinc-950"}`} style={{ width: `${value / max * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Assigned requirements</h2>
          <Link href="/recruiter/requirements" className="text-sm font-semibold text-zinc-600">View all</Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {requirements?.slice(0, 6).map((requirement) => (
            <Link key={requirement.id} href={`/recruiter/requirements/${requirement.id}`} className="rounded-2xl bg-zinc-50 p-5 transition hover:bg-zinc-100">
              <div className="flex justify-between gap-3">
                <p className="font-bold">{requirement.job_title}</p>
                <span className="text-[10px] font-bold uppercase text-zinc-400">{requirement.priority ?? "Normal"}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-500">{requirement.department ?? "General"}</p>
              <p className="mt-4 text-xs font-semibold capitalize text-zinc-700">{String(requirement.status).replaceAll("_", " ")}</p>
            </Link>
          ))}
          {!requirements?.length && <Empty text="No roles assigned yet." />}
        </div>
      </section>
    </div>
  );
}

function normalize(value: string | null) {
  return String(value ?? "").trim().toLowerCase().replaceAll("_", " ");
}

function Stage({ status }: { status: string }) {
  const rejected = normalize(status) === "rejected";
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${rejected ? "bg-red-100 text-red-700" : "bg-zinc-200 text-zinc-700"}`}>
      {rejected && <XCircle size={11} />} {status}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">{text}</p>;
}

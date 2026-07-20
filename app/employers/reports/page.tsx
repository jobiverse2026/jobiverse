import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CalendarDays, CheckCircle2, FileText, Filter, Trophy, Users } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/authorization";
import { getEmployerCompanyAccess, scopeEmployerRequirementQuery } from "@/lib/employer-team/access";

type SearchParams = Promise<{ from?: string; to?: string }>;

export const dynamic = "force-dynamic";

const selectedStatuses = new Set(["selected", "offered", "accepted", "joined", "completed", "placed"]);

function asDateEnd(value?: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T23:59:59.999+05:30`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function asDateStart(value?: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00.000+05:30`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function normalizedRound(value?: string | null) {
  return (value ?? "").toLowerCase().replace(/\s+/g, "");
}

function isL1(value?: string | null) {
  const round = normalizedRound(value);
  return round.includes("l1") || round.includes("round1") || round === "1";
}

function isL2(value?: string | null) {
  const round = normalizedRound(value);
  return round.includes("l2") || round.includes("round2") || round === "2";
}

function candidateIsFulfilled(candidate: any, placements: any[]) {
  const candidateStatus = String(candidate.status ?? "").toLowerCase();
  return selectedStatuses.has(candidateStatus) || placements.some((placement) => selectedStatuses.has(String(placement.status ?? "").toLowerCase()));
}

function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function statusTone(status?: string | null) {
  const value = String(status ?? "").toLowerCase();
  if (selectedStatuses.has(value)) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (["rejected", "cancelled", "dropped"].includes(value)) return "bg-red-50 text-red-700 ring-red-100";
  if (["interview", "screening", "client submitted", "submitted"].some((item) => value.includes(item))) return "bg-blue-50 text-blue-700 ring-blue-100";
  return "bg-zinc-100 text-zinc-600 ring-zinc-200";
}

export default async function EmployerReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await requireRole(["employer"]);
  const params = await searchParams;
  const from = asDateStart(params.from);
  const to = asDateEnd(params.to);
  const access = await getEmployerCompanyAccess(user.id);

  const { data: requirements, error: requirementError } = await scopeEmployerRequirementQuery(adminSupabase
    .from("requirements")
    .select("id, job_title, department, vacancies, status, priority, created_at, assigned_recruiter")
    .order("created_at", { ascending: false }), access, user.id);

  if (requirementError) throw new Error(requirementError.message);

  const requirementIds = (requirements ?? []).map((requirement: any) => requirement.id);
  const assignedRecruiterIds = [...new Set((requirements ?? []).map((requirement: any) => requirement.assigned_recruiter).filter(Boolean))];

  let candidateQuery = requirementIds.length
    ? adminSupabase.from("candidates").select("id, full_name, email, status, created_at, requirement_id, recruiter_id, recruiter_name, recruiter_email").in("requirement_id", requirementIds)
    : null;
  if (candidateQuery && from) candidateQuery = candidateQuery.gte("created_at", from);
  if (candidateQuery && to) candidateQuery = candidateQuery.lte("created_at", to);

  const [{ data: candidates, error: candidateError }, { data: recruiters, error: recruiterError }] = await Promise.all([
    candidateQuery ? candidateQuery.order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null } as any),
    assignedRecruiterIds.length ? adminSupabase.from("users").select("id, full_name, email").in("id", assignedRecruiterIds) : Promise.resolve({ data: [], error: null } as any),
  ]);

  if (candidateError) throw new Error(candidateError.message);
  if (recruiterError) throw new Error(recruiterError.message);

  const candidateIds = (candidates ?? []).map((candidate: any) => candidate.id);
  const [{ data: interviews, error: interviewError }, { data: placements, error: placementError }] = await Promise.all([
    candidateIds.length ? adminSupabase.from("interviews").select("id, requirement_id, candidate_id, interview_round, status, created_at").in("candidate_id", candidateIds) : Promise.resolve({ data: [], error: null } as any),
    candidateIds.length ? adminSupabase.from("placements").select("id, requirement_id, candidate_id, status, offered_ctc, joining_date, created_at").in("candidate_id", candidateIds) : Promise.resolve({ data: [], error: null } as any),
  ]);

  if (interviewError) throw new Error(interviewError.message);
  if (placementError) throw new Error(placementError.message);

  const recruiterById = new Map<string, { id: string; full_name?: string | null; email?: string | null }>(
    (recruiters ?? []).map((recruiter: any) => [String(recruiter.id), recruiter])
  );

  const requirementRows = (requirements ?? []).map((requirement: any, index: number) => {
    const requirementCandidates = (candidates ?? []).filter((candidate: any) => candidate.requirement_id === requirement.id);
    const requirementInterviews = (interviews ?? []).filter((interview: any) => interview.requirement_id === requirement.id);
    const requirementPlacements = (placements ?? []).filter((placement: any) => placement.requirement_id === requirement.id);
    const fulfilledCandidateIds = new Set(requirementCandidates.filter((candidate: any) => candidateIsFulfilled(candidate, requirementPlacements.filter((placement: any) => placement.candidate_id === candidate.id))).map((candidate: any) => candidate.id));
    const assigned = requirement.assigned_recruiter ? recruiterById.get(requirement.assigned_recruiter) : null;
    const openings = Number(requirement.vacancies ?? 0);
    return {
      sr: index + 1,
      id: requirement.id,
      name: requirement.job_title ?? "Untitled requirement",
      department: requirement.department ?? "General",
      status: requirement.status ?? "Open",
      priority: requirement.priority ?? "Normal",
      recruiterName: assigned?.full_name ?? assigned?.email ?? "JobiVerse / Unassigned",
      openings,
      candidates: requirementCandidates,
      l1: requirementInterviews.filter((interview: any) => isL1(interview.interview_round)).length,
      l2: requirementInterviews.filter((interview: any) => isL2(interview.interview_round)).length,
      fulfilled: fulfilledCandidateIds.size,
      sufficed: pct(fulfilledCandidateIds.size, openings),
    };
  });

  const performanceMap = new Map<string, any>();
  for (const candidate of candidates ?? []) {
    const requirement: any = (requirements ?? []).find((item: any) => item.id === candidate.requirement_id);
    const recruiterId = candidate.recruiter_id ?? requirement?.assigned_recruiter ?? "jobiverse";
    const assigned = recruiterId !== "jobiverse" ? recruiterById.get(recruiterId) : null;
    const key = String(recruiterId || candidate.recruiter_email || "jobiverse");
    const existing = performanceMap.get(key) ?? {
      recruiterName: candidate.recruiter_name || assigned?.full_name || assigned?.email || candidate.recruiter_email || "JobiVerse Hiring Team",
      recruiterEmail: candidate.recruiter_email || assigned?.email || "",
      requirementIds: new Set<string>(),
      candidates: 0,
      l1: 0,
      l2: 0,
      fulfilled: 0,
      openingsTouched: 0,
    };
    existing.requirementIds.add(candidate.requirement_id);
    existing.candidates += 1;
    const candidateInterviews = (interviews ?? []).filter((interview: any) => interview.candidate_id === candidate.id);
    existing.l1 += candidateInterviews.filter((interview: any) => isL1(interview.interview_round)).length;
    existing.l2 += candidateInterviews.filter((interview: any) => isL2(interview.interview_round)).length;
    if (candidateIsFulfilled(candidate, (placements ?? []).filter((placement: any) => placement.candidate_id === candidate.id))) existing.fulfilled += 1;
    performanceMap.set(key, existing);
  }

  const performanceRows = [...performanceMap.values()].map((row:any) => {
    row.openingsTouched = [...row.requirementIds].reduce((sum:number, requirementId:any) => {
      const requirement: any = (requirements ?? []).find((item: any) => item.id === requirementId);
      return sum + Number(requirement?.vacancies ?? 0);
    }, 0);
    return { ...row, requirementsWorked: row.requirementIds.size, sufficed: pct(row.fulfilled, row.openingsTouched) };
  }).sort((a, b) => b.candidates - a.candidates);

  const totals = {
    requirements: requirementRows.length,
    submitted: requirementRows.reduce((sum:number, row:any) => sum + row.candidates.length, 0),
    l1: requirementRows.reduce((sum:number, row:any) => sum + row.l1, 0),
    l2: requirementRows.reduce((sum:number, row:any) => sum + row.l2, 0),
    fulfilled: requirementRows.reduce((sum:number, row:any) => sum + row.fulfilled, 0),
    openings: requirementRows.reduce((sum:number, row:any) => sum + row.openings, 0),
  };

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.75rem] bg-zinc-950 p-8 text-white shadow-2xl sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <Trophy className="text-white/80" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Employer hiring reports</p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">See every recruiter, requirement and hiring outcome.</h1>
              <p className="mt-4 max-w-3xl text-zinc-400">Understand recruiter contribution, candidate submissions, interviews and requirement fulfilment from your employer workspace.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[.06] p-6">
              <p className="text-sm font-semibold text-zinc-300">Report period</p>
              <form className="mt-4 grid gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">From</label>
                <input name="from" type="date" defaultValue={params.from ?? ""} className="h-11 rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none" />
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">To</label>
                <input name="to" type="date" defaultValue={params.to ?? ""} className="h-11 rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none" />
                <button className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950"><Filter size={15} />Apply filter</button>
                {(params.from || params.to) && <Link href="/employers/reports" className="text-center text-xs font-semibold text-zinc-400">Clear date filter</Link>}
              </form>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric icon={<BriefcaseBusiness size={18} />} label="Requirements" value={totals.requirements} />
          <Metric icon={<Users size={18} />} label="Candidates submitted" value={totals.submitted} />
          <Metric icon={<CalendarDays size={18} />} label="L1 interviews" value={totals.l1} />
          <Metric icon={<BarChart3 size={18} />} label="L2 interviews" value={totals.l2} />
          <Metric icon={<CheckCircle2 size={18} />} label="Overall sufficed" value={`${pct(totals.fulfilled, totals.openings)}%`} />
        </section>

        <section className="mt-7 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 p-6">
            <h2 className="text-2xl font-bold">Recruiter performance</h2>
            <p className="mt-1 text-sm text-zinc-500">Use this to compare recruiter contribution across your requirements.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Sr No</th>
                  <th className="px-5 py-4">Recruiter</th>
                  <th className="px-5 py-4">Requirements worked</th>
                  <th className="px-5 py-4">Candidates submitted</th>
                  <th className="px-5 py-4">L1</th>
                  <th className="px-5 py-4">L2</th>
                  <th className="px-5 py-4">Fulfilled</th>
                  <th className="px-5 py-4">% sufficed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {performanceRows.length ? performanceRows.map((row, index) => (
                  <tr key={`${row.recruiterName}-${index}`} className="hover:bg-zinc-50/70">
                    <td className="px-5 py-5 font-semibold text-zinc-500">{index + 1}</td>
                    <td className="px-5 py-5">
                      <p className="font-bold text-zinc-950">{row.recruiterName}</p>
                      {row.recruiterEmail && <p className="mt-1 text-xs text-zinc-500">{row.recruiterEmail}</p>}
                    </td>
                    <td className="px-5 py-5">{row.requirementsWorked}</td>
                    <td className="px-5 py-5 font-semibold">{row.candidates}</td>
                    <td className="px-5 py-5">{row.l1}</td>
                    <td className="px-5 py-5">{row.l2}</td>
                    <td className="px-5 py-5">{row.fulfilled}</td>
                    <td className="px-5 py-5 font-bold">{row.sufficed}%</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="px-5 py-14 text-center text-zinc-500">No recruiter performance data found for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-6">
            <div>
              <h2 className="text-2xl font-bold">Requirement fulfilment report</h2>
              <p className="mt-1 text-sm text-zinc-500">Requirement-wise hiring sufficiency and candidate pipeline view.</p>
            </div>
            <Link href="/employers/requirements" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold">Open requirements</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Sr No</th>
                  <th className="px-5 py-4">Requirement name</th>
                  <th className="px-5 py-4">Recruiter</th>
                  <th className="px-5 py-4">Openings</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Candidate status</th>
                  <th className="px-5 py-4">L1</th>
                  <th className="px-5 py-4">L2</th>
                  <th className="px-5 py-4">Fulfilled</th>
                  <th className="px-5 py-4">% sufficed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {requirementRows.length ? requirementRows.map((row:any) => (
                  <tr key={row.id} className="align-top hover:bg-zinc-50/70">
                    <td className="px-5 py-5 font-semibold text-zinc-500">{row.sr}</td>
                    <td className="px-5 py-5">
                      <p className="font-bold text-zinc-950">{row.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{row.department} | {row.status} | {row.priority}</p>
                    </td>
                    <td className="px-5 py-5">{row.recruiterName}</td>
                    <td className="px-5 py-5">{row.openings || "Not set"}</td>
                    <td className="px-5 py-5 font-semibold">{row.candidates.length}</td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        {row.candidates.length ? row.candidates.map((candidate: any) => <span key={`${candidate.id}-status`} className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone(candidate.status)}`}>{candidate.full_name || "Candidate"}: {candidate.status || "Submitted"}</span>) : <span className="text-zinc-400">No submissions</span>}
                      </div>
                    </td>
                    <td className="px-5 py-5">{row.l1}</td>
                    <td className="px-5 py-5">{row.l2}</td>
                    <td className="px-5 py-5">{row.fulfilled}</td>
                    <td className="px-5 py-5">
                      <div className="w-32 rounded-full bg-zinc-100 p-1">
                        <div className="rounded-full bg-zinc-950 py-1 text-center text-[10px] font-bold text-white" style={{ width: `${Math.max(row.sufficed, 8)}%` }}>{row.sufficed}%</div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={10} className="px-5 py-16 text-center text-zinc-500">No employer report data found yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 text-zinc-500">{icon}<span className="text-xs font-bold uppercase tracking-wider">{label}</span></div>
      <p className="mt-4 text-3xl font-bold text-zinc-950">{value}</p>
    </article>
  );
}

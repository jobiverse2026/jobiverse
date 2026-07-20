import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CalendarDays, CheckCircle2, FileText, Filter, Users } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/authorization";

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

function roundName(value?: string | null) {
  return (value ?? "").toLowerCase().replace(/\s+/g, "");
}

function isL1(value?: string | null) {
  const round = roundName(value);
  return round.includes("l1") || round.includes("round1") || round === "1";
}

function isL2(value?: string | null) {
  const round = roundName(value);
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

export default async function RecruiterReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const { user, profile } = await requireRole(["recruiter"]);
  const params = await searchParams;
  const from = asDateStart(params.from);
  const to = asDateEnd(params.to);

  let candidateQuery = adminSupabase
    .from("candidates")
    .select("id, full_name, email, status, created_at, requirement_id, recruiter_id, recruiter_name, recruiter_email")
    .order("created_at", { ascending: false });

  const email = profile.email ? String(profile.email).toLowerCase() : "";
  candidateQuery = email
    ? candidateQuery.or(`recruiter_id.eq.${user.id},recruiter_email.eq.${email}`)
    : candidateQuery.eq("recruiter_id", user.id);
  if (from) candidateQuery = candidateQuery.gte("created_at", from);
  if (to) candidateQuery = candidateQuery.lte("created_at", to);

  const [{ data: assignedRequirements, error: reqError }, { data: submittedCandidates, error: candidateError }] = await Promise.all([
    adminSupabase
      .from("requirements")
      .select("id, job_title, department, vacancies, status, priority, created_at, assigned_recruiter")
      .eq("assigned_recruiter", user.id)
      .order("created_at", { ascending: false }),
    candidateQuery,
  ]);

  if (reqError) throw new Error(reqError.message);
  if (candidateError) throw new Error(candidateError.message);

  const assignedIds = new Set((assignedRequirements ?? []).map((item: any) => item.id));
  const candidateRequirementIds = new Set((submittedCandidates ?? []).map((candidate: any) => candidate.requirement_id).filter(Boolean));
  const extraRequirementIds = [...candidateRequirementIds].filter((id) => !assignedIds.has(id));

  const { data: extraRequirements, error: extraError } = extraRequirementIds.length
    ? await adminSupabase.from("requirements").select("id, job_title, department, vacancies, status, priority, created_at, assigned_recruiter").in("id", extraRequirementIds)
    : { data: [], error: null };
  if (extraError) throw new Error(extraError.message);

  const requirements = [...(assignedRequirements ?? []), ...(extraRequirements ?? [])];
  const requirementIds = requirements.map((item: any) => item.id);
  const candidateIds = (submittedCandidates ?? []).map((candidate: any) => candidate.id);

  const [{ data: interviews, error: interviewError }, { data: placements, error: placementError }] = await Promise.all([
    candidateIds.length
      ? adminSupabase.from("interviews").select("id, requirement_id, candidate_id, interview_round, status, created_at").in("candidate_id", candidateIds)
      : Promise.resolve({ data: [], error: null } as any),
    candidateIds.length
      ? adminSupabase.from("placements").select("id, requirement_id, candidate_id, status, offered_ctc, joining_date, created_at").in("candidate_id", candidateIds)
      : Promise.resolve({ data: [], error: null } as any),
  ]);

  if (interviewError) throw new Error(interviewError.message);
  if (placementError) throw new Error(placementError.message);

  const rows = requirementIds.map((requirementId, index) => {
    const requirement: any = requirements.find((item: any) => item.id === requirementId);
    const candidates = (submittedCandidates ?? []).filter((candidate: any) => candidate.requirement_id === requirementId);
    const requirementInterviews = (interviews ?? []).filter((interview: any) => interview.requirement_id === requirementId);
    const requirementPlacements = (placements ?? []).filter((placement: any) => placement.requirement_id === requirementId);
    const fulfilledCandidateIds = new Set(candidates.filter((candidate: any) => candidateIsFulfilled(candidate, requirementPlacements.filter((placement: any) => placement.candidate_id === candidate.id))).map((candidate: any) => candidate.id));
    const openings = Number(requirement?.vacancies ?? 0);
    return {
      sr: index + 1,
      requirementName: requirement?.job_title ?? "Untitled requirement",
      department: requirement?.department ?? "General",
      requirementStatus: requirement?.status ?? "Open",
      priority: requirement?.priority ?? "Normal",
      openings,
      candidates,
      l1: requirementInterviews.filter((interview: any) => isL1(interview.interview_round)).length,
      l2: requirementInterviews.filter((interview: any) => isL2(interview.interview_round)).length,
      fulfilled: fulfilledCandidateIds.size,
      sufficed: pct(fulfilledCandidateIds.size, openings),
    };
  });

  const totals = {
    requirements: rows.length,
    submitted: rows.reduce((sum, row) => sum + row.candidates.length, 0),
    l1: rows.reduce((sum, row) => sum + row.l1, 0),
    l2: rows.reduce((sum, row) => sum + row.l2, 0),
    fulfilled: rows.reduce((sum, row) => sum + row.fulfilled, 0),
    openings: rows.reduce((sum, row) => sum + row.openings, 0),
  };

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-[2.75rem] bg-zinc-950 p-8 text-white shadow-2xl sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <FileText className="text-white/80" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Recruiter performance reports</p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Your hiring delivery, clearly measured.</h1>
              <p className="mt-4 max-w-3xl text-zinc-400">Track submitted candidates, interview movement, fulfilment and requirement health from live JobiVerse hiring data.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[.06] p-6">
              <p className="text-sm font-semibold text-zinc-300">Report period</p>
              <form className="mt-4 grid gap-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">From</label>
                <input name="from" type="date" defaultValue={params.from ?? ""} className="h-11 rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none" />
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">To</label>
                <input name="to" type="date" defaultValue={params.to ?? ""} className="h-11 rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none" />
                <button className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950"><Filter size={15} />Apply filter</button>
                {(params.from || params.to) && <Link href="/recruiter/reports" className="text-center text-xs font-semibold text-zinc-400">Clear date filter</Link>}
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-6">
            <div>
              <h2 className="text-2xl font-bold">Requirement-wise report</h2>
              <p className="mt-1 text-sm text-zinc-500">Export-friendly view for daily, weekly or monthly recruiter reporting.</p>
            </div>
            <Link href="/recruiter/requirements" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold">Open requirements</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-4">Sr No</th>
                  <th className="px-5 py-4">Requirement name</th>
                  <th className="px-5 py-4">Openings</th>
                  <th className="px-5 py-4">No. submitted</th>
                  <th className="px-5 py-4">Candidates submitted</th>
                  <th className="px-5 py-4">Current status</th>
                  <th className="px-5 py-4">L1</th>
                  <th className="px-5 py-4">L2</th>
                  <th className="px-5 py-4">Fulfilled</th>
                  <th className="px-5 py-4">% sufficed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.length ? rows.map((row) => (
                  <tr key={`${row.requirementName}-${row.sr}`} className="align-top hover:bg-zinc-50/70">
                    <td className="px-5 py-5 font-semibold text-zinc-500">{row.sr}</td>
                    <td className="px-5 py-5">
                      <p className="font-bold text-zinc-950">{row.requirementName}</p>
                      <p className="mt-1 text-xs text-zinc-500">{row.department} | {row.requirementStatus} | {row.priority}</p>
                    </td>
                    <td className="px-5 py-5">{row.openings || "Not set"}</td>
                    <td className="px-5 py-5 font-semibold">{row.candidates.length}</td>
                    <td className="px-5 py-5">
                      <div className="flex max-w-md flex-wrap gap-2">
                        {row.candidates.length ? row.candidates.map((candidate: any) => <span key={candidate.id} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">{candidate.full_name || candidate.email || "Candidate"}</span>) : <span className="text-zinc-400">No submissions</span>}
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        {row.candidates.length ? row.candidates.map((candidate: any) => <span key={`${candidate.id}-status`} className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone(candidate.status)}`}>{candidate.status || "Submitted"}</span>) : <span className="text-zinc-400">-</span>}
                      </div>
                    </td>
                    <td className="px-5 py-5 font-semibold">{row.l1}</td>
                    <td className="px-5 py-5 font-semibold">{row.l2}</td>
                    <td className="px-5 py-5 font-semibold">{row.fulfilled}</td>
                    <td className="px-5 py-5">
                      <div className="w-32 rounded-full bg-zinc-100 p-1">
                        <div className="rounded-full bg-zinc-950 py-1 text-center text-[10px] font-bold text-white" style={{ width: `${Math.max(row.sufficed, 8)}%` }}>{row.sufficed}%</div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={10} className="px-5 py-16 text-center text-zinc-500">No recruiter report data found for this period.</td>
                  </tr>
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

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  GraduationCap,
  MapPin,
  Users,
  WalletCards,
} from "lucide-react";

import { getAssignableRequirementRecruiters, getRequirement, getRequirementRecruiterAssignments } from "@/actions/requirements";
import RequirementControls from "@/components/employer/requirements/RequirementControls";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function EmployerRequirementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [requirement, recruiters, assignedRecruiterIds] = await Promise.all([
    getRequirement(id),
    getAssignableRequirementRecruiters(),
    getRequirementRecruiterAssignments(id),
  ]);
  const [{ data: submittedCandidates }, { data: externalApplicants }] = await Promise.all([
    adminSupabase
      .from("candidates")
      .select("id,full_name,status,total_experience,current_location,primary_skills,source,recruiter_name,recruiter_email,created_at")
      .eq("requirement_id", requirement.id)
      .order("created_at", { ascending: false }),
    adminSupabase
      .from("candidate_applications")
      .select("id,applicant_name,status,total_experience,current_location,primary_skills,applied_at")
      .eq("requirement_id", requirement.id)
      .order("applied_at", { ascending: false }),
  ]);
  const candidateRows = [
    ...((submittedCandidates ?? []) as any[]).map((candidate) => ({
      id: candidate.id,
      name: candidate.full_name || "Candidate",
      status: candidate.status || "Submitted",
      experience: candidate.total_experience,
      location: candidate.current_location,
      skills: candidate.primary_skills,
      source: isJobiverseCandidate(candidate) ? "JobiVerse" : "Recruiter",
      href: `/employers/candidates/${candidate.id}`,
      date: candidate.created_at,
    })),
    ...((externalApplicants ?? []) as any[]).map((application) => ({
      id: `external-${application.id}`,
      name: application.applicant_name || "Candidate",
      status: application.status || "Applied",
      experience: application.total_experience,
      location: application.current_location,
      skills: application.primary_skills,
      source: "External",
      href: `/employers/external-applicants/${application.id}`,
      date: application.applied_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <RequirementControls requirement={requirement} recruiters={recruiters} assignedRecruiterIds={assignedRecruiterIds} />
          <section className="rounded-[2.25rem] border border-amber-200 bg-amber-50 p-6">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-700">Hiring channel</p>
            <h2 className="mt-2 text-xl font-semibold text-amber-950">
              {requirement.hiring_team_requested ? "JobiVerse hiring support is requested" : "Self-managed requirement"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-amber-900">
              {requirement.hiring_team_requested
                ? "JobiVerse team can submit screened candidates to this requirement, while you keep marketplace and status control."
                : "You can publish this role to the candidate marketplace anytime or manage it privately with your team."}
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-[2.25rem] border border-white bg-white/90 p-7 shadow-[0_30px_80px_-50px_rgba(0,0,0,.45)] backdrop-blur-xl sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Requirement candidates</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{candidateRows.length} candidate{candidateRows.length === 1 ? "" : "s"} for this role</h2>
              <p className="mt-2 text-sm text-zinc-500">Includes recruiter-submitted, JobiVerse-submitted and direct Jobs Portal applicants.</p>
            </div>
            <Link href={`/employers/candidates?requirement=${requirement.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">
              Explore candidates for this requirement <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-100">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-5 py-4">Candidate</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Experience</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Skills</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {candidateRows.length ? candidateRows.map((candidate) => (
                  <tr key={candidate.id} className="border-t border-zinc-100">
                    <td className="px-5 py-4 font-semibold text-zinc-950">{candidate.name}</td>
                    <td className="px-5 py-4"><SourceBadge source={candidate.source} /></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">{candidate.status}</span></td>
                    <td className="px-5 py-4 text-zinc-600">{candidate.experience || "Not specified"}</td>
                    <td className="px-5 py-4 text-zinc-600">{candidate.location || "Not specified"}</td>
                    <td className="max-w-[280px] px-5 py-4 text-zinc-600">{candidate.skills || "Under review"}</td>
                    <td className="px-5 py-4 text-right"><Link href={candidate.href} className="font-semibold text-zinc-950 underline-offset-4 hover:underline">Open</Link></td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="px-5 py-14 text-center text-zinc-500">No candidates submitted for this requirement yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function isJobiverseCandidate(candidate: any) {
  return candidate.source === "jobiverse_hiring_team"
    || candidate.recruiter_name === "JobiVerse Hiring Team"
    || String(candidate.recruiter_email ?? "").toLowerCase() === "jobiverse@outlook.com";
}

function SourceBadge({ source }: { source: string }) {
  const tone = source === "JobiVerse"
    ? "bg-amber-50 text-amber-700"
    : source === "External"
      ? "bg-violet-50 text-violet-700"
      : "bg-blue-50 text-blue-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{source}</span>;
}

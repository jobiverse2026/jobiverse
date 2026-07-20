import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Download, MapPin, ShieldCheck } from "lucide-react";

import { requireRole } from "@/lib/auth/authorization";
import { getEmployerCompanyAccess, scopeEmployerJoinedRequirementQuery } from "@/lib/employer-team/access";
import InterviewScheduler from "@/components/employer/candidates/InterviewScheduler";
import { firstRelation } from "@/lib/relations";
import { adminSupabase } from "@/lib/supabase/admin";
import { manageEmployerCandidateOffer, updateEmployerCandidateStatus } from "../actions";

const employerCandidateStatuses = ["Submitted", "Client Submitted", "Interview", "Selected", "Offered", "Joined", "Rejected", "Withdrawn"] as const;

export default async function EmployerCandidateDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ status_updated?: string; offer_updated?: string }> }) {
  const { id } = await params;
  const { status_updated, offer_updated } = await searchParams;
  const { user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);

  const { data: candidate } = await scopeEmployerJoinedRequirementQuery(adminSupabase
    .from("candidates")
    .select(`
      id, full_name, email, phone, current_location, total_experience,
      current_company, current_ctc, expected_ctc, notice_period,
      primary_skills, secondary_skills, resume_path, linkedin, status, source, recruiter_name, recruiter_email, created_at,
      requirements!inner(id, job_title, employer_id, company_id, status),
      interviews(id, interview_round, interview_date, interview_mode, meeting_link, interviewer_name, status, feedback, rating),
      placements(id, status, offered_ctc, joining_date, replacement_end_date)
    `)
    .eq("id", id), access, user.id)
    .maybeSingle();

  if (!candidate) notFound();

  const { data: signedResume } = candidate.resume_path
    ? await adminSupabase.storage.from("candidate-resumes").createSignedUrl(candidate.resume_path, 3600)
    : { data: null };

  const profileDetails = [
    ["Experience", candidate.total_experience],
    ["Current company", candidate.current_company],
    ["Location", candidate.current_location],
    ["Notice period", candidate.notice_period],
    ["Current CTC", candidate.current_ctc],
    ["Expected CTC", candidate.expected_ctc],
  ];
  const placement = firstRelation(candidate.placements);
  const requirement = firstRelation(candidate.requirements);
  const displayName = candidate.full_name || "Candidate";
  const isJobiVerseCandidate =
    candidate.source === "jobiverse_hiring_team" ||
    candidate.recruiter_name === "JobiVerse Hiring Team" ||
    candidate.recruiter_email === "jobiverse@outlook.com";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,white,transparent_28%),radial-gradient(circle_at_88%_22%,rgba(99,102,241,.11),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl">
        <Link href="/employers/candidates" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-xl transition hover:-translate-x-1"><ArrowLeft size={16} /> Submitted candidates</Link>

        <section className="mt-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.65)] sm:p-12">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-zinc-200">{candidate.status}</span><h1 className="mt-7 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{displayName}</h1><p className="mt-4 flex items-center gap-2 text-zinc-300"><BriefcaseBusiness size={17} /> {requirement?.job_title ?? "Hiring requirement"}</p></div>{signedResume?.signedUrl && <a href={signedResume.signedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-zinc-200"><Download size={18} /> Open Resume</a>}</div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            {isJobiVerseCandidate && <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-amber-700"/><div><p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700">JobiVerse introduction protection</p><h2 className="mt-2 text-xl font-semibold text-amber-950">Hiring activity must remain declared.</h2><p className="mt-2 text-sm leading-6 text-amber-900">This candidate was introduced through the JobiVerse Hiring Team. Standard success fee is fixed at 5% of annual CTC after successful joining. A different negotiated rate applies only when a separate formal partnership agreement has been accepted. Interviews, offers and joining—whether coordinated inside or outside the platform—must be updated in JobiVerse.</p></div></div></section>}
            {placement && <section className="rounded-[2rem] border border-white bg-white/90 p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,.5)] backdrop-blur-xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Offer & joining</p><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-2xl bg-zinc-50 p-5"><p className="text-xs uppercase tracking-wide text-zinc-400">Status</p><p className="mt-2 font-semibold capitalize">{placement.status}</p></div><div className="rounded-2xl bg-zinc-50 p-5"><p className="text-xs uppercase tracking-wide text-zinc-400">Offered CTC</p><p className="mt-2 font-semibold">{placement.offered_ctc ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(placement.offered_ctc) : "Not specified"}</p></div><div className="rounded-2xl bg-zinc-50 p-5"><p className="text-xs uppercase tracking-wide text-zinc-400">Joining date</p><p className="mt-2 font-semibold">{placement.joining_date ? new Date(placement.joining_date).toLocaleDateString("en-IN") : "Not confirmed"}</p></div><div className="rounded-2xl bg-zinc-50 p-5"><p className="text-xs uppercase tracking-wide text-zinc-400">Replacement until</p><p className="mt-2 font-semibold">{placement.replacement_end_date ? new Date(placement.replacement_end_date).toLocaleDateString("en-IN") : "After joining"}</p></div></div></section>}

            <section className="rounded-[2rem] border border-white bg-white/90 p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,.5)] backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Professional profile</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">{profileDetails.map(([label, value]) => <div key={label} className="rounded-2xl bg-zinc-50 p-5"><p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p><p className="mt-2 font-semibold text-zinc-800">{value || "Not specified"}</p></div>)}</div>
              <div className="mt-6 rounded-2xl border border-zinc-100 p-5"><p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Primary skills</p><p className="mt-2 leading-7 text-zinc-700">{candidate.primary_skills || "Not specified"}</p></div>
              {candidate.secondary_skills && <div className="mt-4 rounded-2xl border border-zinc-100 p-5"><p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Secondary skills</p><p className="mt-2 leading-7 text-zinc-700">{candidate.secondary_skills}</p></div>}
            </section>

            <section className="rounded-[2rem] border border-white bg-white/90 p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,.5)] backdrop-blur-xl">
              <h2 className="text-2xl font-semibold">Interview timeline</h2>
              {!candidate.interviews?.length ? <p className="mt-5 text-zinc-500">No interviews scheduled yet.</p> : <div className="mt-6 space-y-4">{(candidate.interviews as any[]).map((interview:any) => <div key={interview.id} className="rounded-2xl border border-zinc-100 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">{interview.interview_round}</p><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold capitalize">{interview.status}</span></div><p className="mt-3 flex items-center gap-2 text-sm text-zinc-600"><CalendarDays size={15} /> {new Date(interview.interview_date).toLocaleString("en-IN")}</p><p className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><MapPin size={15} /> {interview.interview_mode || "Mode not specified"}</p>{interview.meeting_link && <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-zinc-950 underline">Open meeting link</a>}{interview.feedback && <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-700"><span className="font-semibold">Interview feedback:</span> {interview.feedback}{interview.rating && <span className="ml-2 font-semibold">| {interview.rating}/5</span>}</div>}</div>)}</div>}
            </section>
          </div>

          <div className="space-y-6">
            {status_updated === "1" && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Candidate status updated and JobiVerse has been notified.</p>}
            {offer_updated === "1" && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Offer or joining details saved successfully.</p>}
            <form action={updateEmployerCandidateStatus} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Employer status control</p>
              <h2 className="mt-2 text-2xl font-semibold">Update candidate stage</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">If this is a JobiVerse-submitted profile, every status change notifies the JobiVerse team.</p>
              <input type="hidden" name="candidateId" value={candidate.id} />
              <select name="status" defaultValue={candidate.status} className="mt-5 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500">
                {employerCandidateStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <button className="mt-4 w-full cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white transition hover:bg-zinc-800">Save status</button>
            </form>
            <InterviewScheduler candidateId={candidate.id} />
            <form action={manageEmployerCandidateOffer} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Offer desk</p>
              <h2 className="mt-2 text-2xl font-semibold">Offer / joining details</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Use this when an offer is released, accepted, joined, declined or completed.</p>
              <input type="hidden" name="candidateId" value={candidate.id} />
              <label className="mt-5 block text-sm font-medium text-zinc-700">Offer status
                <select name="placementStatus" defaultValue={placement?.status ?? "offered"} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500">
                  <option value="offered">Offered</option>
                  <option value="accepted">Accepted</option>
                  <option value="joined">Joined</option>
                  <option value="declined">Declined</option>
                  <option value="no_show">No show</option>
                  <option value="replacement">Replacement</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label className="mt-4 block text-sm font-medium text-zinc-700">Annual offered CTC
                <input name="offeredCtc" type="number" min="1" step="1" defaultValue={placement?.offered_ctc ?? ""} placeholder="1200000" className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500" />
              </label>
              <label className="mt-4 block text-sm font-medium text-zinc-700">Joining date
                <input name="joiningDate" type="date" defaultValue={placement?.joining_date ?? ""} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500" />
              </label>
              <button className="mt-5 w-full cursor-pointer rounded-xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-5 py-3 font-semibold text-white transition hover:shadow-lg">Save offer details</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

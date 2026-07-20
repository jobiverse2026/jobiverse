import { BriefcaseBusiness, Mail, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";

import { updateCandidateStatus } from "@/app/admin/directory-actions";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const statuses = ["Submitted", "Screening", "Client Submitted", "Interview", "Selected", "Offered", "Joined", "Rejected", "Withdrawn"] as const;
const externalStatuses = ["Applied", "Under Review", "Shortlisted", "Interview", "Offered", "Hired", "Rejected", "Withdrawn"] as const;

export default async function AdminCandidatesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; source?: string }> }) {
  await requireRole(["admin"]);
  const { q = "", status = "all", source = "all" } = await searchParams;

  const [{ data: candidates, error }, { data: requirements }, { data: companies }, { data: externalApplications, error: externalError }] = await Promise.all([
    adminSupabase
      .from("candidates")
      .select("id,requirement_id,recruiter_id,recruiter_name,recruiter_email,full_name,email,phone,current_location,total_experience,current_company,primary_skills,status,created_at")
      .or("recruiter_name.eq.JobiVerse Hiring Team,recruiter_email.eq.jobiverse@outlook.com")
      .order("created_at", { ascending: false })
      .limit(300),
    adminSupabase.from("requirements").select("id,company_id,job_title,hiring_team_requested,is_public"),
    adminSupabase.from("companies").select("id,company_name"),
    adminSupabase
      .from("candidate_applications")
      .select("id,requirement_id,candidate_user_id,applicant_name,applicant_email,applicant_phone,current_location,total_experience,current_company,primary_skills,status,created_at,requirements(id,company_id,job_title,companies(company_name))")
      .order("created_at", { ascending: false })
      .limit(300),
  ]);

  if (error) throw new Error(error.message);
  if (externalError) throw new Error(externalError.message);

  const requirementMap = new Map((requirements ?? []).map((item) => [item.id, item]));
  const companyMap = new Map((companies ?? []).map((item) => [item.id, item.company_name]));
  const normalized = q.trim().toLowerCase();

  const jobiverseRows = (candidates ?? []).filter((candidate) =>
    (source === "all" || source === "jobiverse") &&
    (status === "all" || candidate.status === status) &&
    (!normalized || [candidate.full_name, candidate.email, candidate.phone, candidate.primary_skills, candidate.current_company].some((value) => value?.toLowerCase().includes(normalized)))
  );

  const externalRows = (externalApplications ?? []).filter((application: any) => {
    const requirement = first(application.requirements);
    const company = first(requirement?.companies);
    return (source === "all" || source === "external") &&
      (status === "all" || application.status === status) &&
      (!normalized || [application.applicant_name, application.applicant_email, application.applicant_phone, application.primary_skills, application.current_company, requirement?.job_title, company?.company_name].some((value) => String(value ?? "").toLowerCase().includes(normalized)));
  });

  const activeCount = jobiverseRows.filter((candidate) => !["Joined", "Rejected", "Withdrawn"].includes(candidate.status)).length;
  const externalActiveCount = externalRows.filter((application: any) => !["Hired", "Rejected", "Withdrawn"].includes(application.status)).length;
  const stageSummary = [
    ...statuses.map((item) => ({ label: item, value: jobiverseRows.filter((candidate) => candidate.status === item).length })),
    ...externalStatuses.map((item) => ({ label: `External ${item}`, value: externalRows.filter((application: any) => application.status === item).length })),
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-2xl sm:p-10">
        <Users />
        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-zinc-500">JobiVerse hiring intelligence</p>
        <h1 className="mt-3 text-4xl font-bold">Candidate Tracking Desk</h1>
        <p className="mt-3 max-w-3xl text-zinc-400">
          Track JobiVerse-submitted candidates and direct applicants from the Jobs Portal in one admin view. Direct applicants are highlighted separately for 3% placement-fee tracking.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-4">
        <Metric label="JobiVerse submissions" value={jobiverseRows.length} />
        <Metric label="Direct applicants" value={externalRows.length} />
        <Metric label="Active pipeline" value={activeCount + externalActiveCount} />
        <Metric label="Joined / hired" value={jobiverseRows.filter((item) => item.status === "Joined").length + externalRows.filter((item: any) => item.status === "Hired").length} />
      </section>

      {stageSummary.length > 0 && (
        <section className="rounded-3xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Pipeline analytics</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {stageSummary.map((item) => (
              <span key={item.label} className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700">{item.label}: {item.value}</span>
            ))}
          </div>
        </section>
      )}

      <form className="grid gap-3 rounded-3xl border border-zinc-200 bg-white p-5 md:grid-cols-[1fr_180px_220px_auto]">
        <input name="q" defaultValue={q} placeholder="Search candidate, email, company, role or skills" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-zinc-500" />
        <select name="source" defaultValue={source} className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4">
          <option value="all">All sources</option>
          <option value="jobiverse">JobiVerse submitted</option>
          <option value="external">Direct applicants</option>
        </select>
        <select name="status" defaultValue={status} className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4">
          <option value="all">All statuses</option>
          {[...statuses, ...externalStatuses].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="cursor-pointer rounded-xl bg-zinc-950 px-6 font-semibold text-white">Apply filters</button>
      </form>

      {(source === "all" || source === "jobiverse") && (
        <section className="space-y-4">
          <SectionTitle icon={<ShieldCheck size={18} />} title="JobiVerse submitted candidates" description="Profiles introduced by the JobiVerse Hiring Team." />
          {jobiverseRows.length ? jobiverseRows.map((candidate) => {
            const requirement = requirementMap.get(candidate.requirement_id);
            const company = requirement ? companyMap.get(requirement.company_id) : null;
            return (
              <article key={candidate.id} className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_24px_80px_-55px_rgba(16,185,129,.5)]">
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/requirements/${candidate.requirement_id}`} className="group inline-flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-sm font-bold text-white group-hover:bg-white group-hover:text-zinc-950">{(candidate.full_name || "C").slice(0, 1).toUpperCase()}</span>
                        <span><span className="block text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-300">Candidate card</span><span className="block text-xl font-bold">{candidate.full_name}</span></span>
                      </Link>
                      <Status status={candidate.status} />
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700"><ShieldCheck size={12} />JobiVerse submitted</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                      <span className="flex items-center gap-2"><Mail size={14} />{candidate.email}</span>
                      {candidate.current_location && <span className="flex items-center gap-2"><MapPin size={14} />{candidate.current_location}</span>}
                    </div>
                    <p className="mt-4 text-sm text-zinc-600">{candidate.primary_skills || "Skills not provided"}</p>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[620px]">
                    <Small label="Role" value={requirement?.job_title || "-"} />
                    <Small label="Company" value={company || "-"} />
                    <Small label="Source" value="JobiVerse Team" />
                    <Small label="Experience" value={candidate.total_experience || "-"} />
                  </div>
                </div>
                <form action={updateCandidateStatus} className="mt-5 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center">
                  <input type="hidden" name="candidateId" value={candidate.id} />
                  <label className="text-xs font-bold uppercase text-zinc-400">Update JobiVerse pipeline status</label>
                  <select name="status" defaultValue={candidate.status} className="h-11 min-w-56 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm">{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
                  <button className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white"><BriefcaseBusiness size={15} />Save status</button>
                </form>
              </article>
            );
          }) : <Empty text="No JobiVerse submitted candidates match these filters." />}
        </section>
      )}

      {(source === "all" || source === "external") && (
        <section className="space-y-4">
          <SectionTitle icon={<Sparkles size={18} />} title="Direct external applicants" description="Candidates who applied from the public Jobs Portal. Track separately for 3% placement-fee protection." />
          {externalRows.length ? externalRows.map((application: any) => {
            const requirement = first(application.requirements);
            const company = first(requirement?.companies);
            return (
              <article key={application.id} className="rounded-3xl border border-violet-200 bg-violet-50/70 p-6 shadow-[0_24px_80px_-55px_rgba(124,58,237,.45)]">
                <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-3 rounded-2xl border border-violet-200 bg-white px-4 py-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-700 text-sm font-bold text-white">{(application.applicant_name || "A").slice(0, 1).toUpperCase()}</span>
                        <span><span className="block text-xs font-bold uppercase tracking-wider text-violet-400">Direct applicant</span><span className="block text-xl font-bold text-zinc-950">{application.applicant_name}</span></span>
                      </span>
                      <ExternalStatus status={application.status} />
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-[10px] font-bold uppercase text-violet-700">Jobs Portal • 3% tracking</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                      <span className="flex items-center gap-2"><Mail size={14} />{application.applicant_email}</span>
                      {application.current_location && <span className="flex items-center gap-2"><MapPin size={14} />{application.current_location}</span>}
                    </div>
                    <p className="mt-4 text-sm text-zinc-700">{application.primary_skills || "Skills not provided"}</p>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[620px]">
                    <Small label="Role" value={requirement?.job_title || "-"} />
                    <Small label="Company" value={company?.company_name || "-"} />
                    <Small label="Source" value="Jobs Portal" />
                    <Small label="Experience" value={application.total_experience || "-"} />
                  </div>
                </div>
              </article>
            );
          }) : <Empty text="No direct external applicants match these filters." />}
        </section>
      )}
    </div>
  );
}

function first(value: any) {
  return Array.isArray(value) ? value[0] : value;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article className="rounded-3xl border border-zinc-200 bg-white p-6"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>;
}

function SectionTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white">{icon}</span><div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-1 text-sm text-zinc-500">{description}</p></div></div>;
}

function Small({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl bg-white/80 p-3"><p className="text-[10px] font-bold uppercase text-zinc-400">{label}</p><p className="mt-1 truncate text-sm font-semibold">{value}</p></div>;
}

function Status({ status }: { status: string }) {
  const tone = status === "Joined" ? "bg-emerald-100 text-emerald-700" : status === "Rejected" || status === "Withdrawn" ? "bg-red-100 text-red-700" : status === "Offered" || status === "Selected" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700";
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${tone}`}>{status}</span>;
}

function ExternalStatus({ status }: { status: string }) {
  const tone = status === "Hired" ? "bg-emerald-100 text-emerald-700" : status === "Rejected" || status === "Withdrawn" ? "bg-red-100 text-red-700" : status === "Offered" || status === "Shortlisted" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700";
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${tone}`}>{status}</span>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-3xl border border-dashed border-zinc-200 bg-white p-12 text-center text-zinc-500">{text}</p>;
}

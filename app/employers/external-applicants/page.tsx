import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin, UserRoundSearch } from "lucide-react";
import { JobiVerseCard } from "@/components/candidate/jobiverse-card";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export default async function ExternalApplicantsPage() {
  const { user } = await requireRole(["employer"]);
  const { data: applications, error } = await adminSupabase
    .from("candidate_applications")
    .select("id,candidate_user_id,status,applicant_name,current_location,total_experience,relevant_experience_years,primary_skills,why_fit,applied_at,requirements!inner(job_title,employer_id)")
    .eq("requirements.employer_id", user.id)
    .order("applied_at", { ascending: false });
  if (error) throw new Error(error.message);
  const candidateIds = [...new Set((applications ?? []).map((application) => application.candidate_user_id).filter(Boolean))];
  const [{ data: people }, { data: profiles }, { data: passports }] = candidateIds.length ? await Promise.all([
    adminSupabase.from("users").select("id,full_name,avatar_url").in("id", candidateIds),
    adminSupabase.from("candidate_profiles").select("user_id,headline,current_location,total_experience,primary_skills,preferred_roles,role_level,industry,functional_area,work_mode,open_to_work,profile_completion").in("user_id", candidateIds),
    adminSupabase.from("career_passports").select("user_id,headline,summary,visibility,public_slug,open_to_opportunities").in("user_id", candidateIds),
  ]) : [{ data: [] }, { data: [] }, { data: [] }];
  const peopleMap = new Map((people ?? []).map((item) => [item.id, item]));
  const profileMap = new Map((profiles ?? []).map((item) => [item.user_id, item]));
  const passportMap = new Map((passports ?? []).map((item) => [item.user_id, item]));

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/employers/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16} />Employer dashboard</Link>
        <section className="mt-7 rounded-[2.75rem] bg-gradient-to-br from-violet-950 via-zinc-950 to-zinc-800 p-9 text-white sm:p-12"><UserRoundSearch /><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-violet-300">JobiVerse Jobs Portal</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">External applicants.</h1><p className="mt-4 text-zinc-300">Review applications with each candidate&apos;s universal JobiVerse Card before moving them through your hiring workflow.</p></section>
        {!applications?.length ? <section className="mt-7 rounded-[2rem] border border-dashed bg-white p-16 text-center"><UserRoundSearch className="mx-auto text-zinc-400" /><h2 className="mt-4 text-2xl font-semibold">No external applications yet</h2></section> : <section className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{applications.map((application) => { const requirement = application.requirements?.[0]; const candidateId = application.candidate_user_id; return <Link href={`/employers/external-applicants/${application.id}`} key={application.id} className="group flex flex-col rounded-[2rem] border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="flex justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><UserRoundSearch size={20} /></span><span className="h-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{application.status}</span></div><h2 className="mt-6 text-2xl font-semibold">{application.applicant_name || "Candidate"}</h2><p className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><BriefcaseBusiness size={14} />{requirement?.job_title}</p><p className="mt-3 flex items-center gap-2 text-sm text-zinc-500"><MapPin size={14} />{application.current_location || "Location not provided"}</p>{candidateId && <div className="mt-5"><JobiVerseCard person={peopleMap.get(candidateId)} profile={profileMap.get(candidateId)} passport={passportMap.get(candidateId)} compact /></div>}<p className="mt-4 line-clamp-2 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600"><strong>Why fit:</strong> {application.why_fit || "Open the complete application to review the candidate response."}</p><p className="mt-auto flex items-center justify-between border-t pt-5 text-sm font-semibold">View applicant workflow<ArrowRight size={15} className="transition group-hover:translate-x-1" /></p></Link>; })}</section>}
      </div>
    </main>
  );
}

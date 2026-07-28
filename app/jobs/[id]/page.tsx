import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, Building2, CalendarDays, IndianRupee, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateOpportunityTrust, estimateSalaryRange } from "@/lib/jobs/intelligence";

type Props = { params: Promise<{ id: string }> };
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.jobiverse.in").replace(/\/$/, "");

async function getPublicJob(id: string) {
  const { data } = await adminSupabase.from("requirements")
    .select("id,job_title,department,employment_type,work_mode,experience,vacancies,budget_ctc,location,notice_period,primary_skills,education,job_description,status,is_public,published_at,updated_at,company_id,employer_id,companies(company_name,is_verified,industry,website,location,description,company_size,logo_url)")
    .eq("id", id).eq("is_public", true).not("status", "in", '("Closed","Cancelled")').maybeSingle();
  if (!data) return null;
  const relatedCompany = data.companies?.[0] ?? null;
  const { data: fallback } = relatedCompany ? { data: null } : await adminSupabase.from("companies").select("company_name,is_verified,industry,website,location,description,company_size,logo_url").eq("owner_id", data.employer_id).maybeSingle();
  return { job: data, company: relatedCompany ?? fallback };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; const result = await getPublicJob(id);
  if (!result) return { title: "Job unavailable | JobiVerse", robots: { index: false, follow: false } };
  const company = result.company?.company_name || "JobiVerse employer";
  const description = String(result.job.job_description || `${result.job.job_title} opportunity at ${company}`).replace(/\s+/g, " ").slice(0, 155);
  return { title: `${result.job.job_title} at ${company} | JobiVerse Jobs`, description, alternates: { canonical: `${siteUrl}/jobs/${id}` }, openGraph: { title: `${result.job.job_title} at ${company}`, description, url: `${siteUrl}/jobs/${id}`, type: "website" } };
}

export default async function PublicDirectJobPage({ params }: Props) {
  const { id } = await params; const result = await getPublicJob(id); if (!result) notFound();
  const { job, company } = result;
  const trust = calculateOpportunityTrust({ title: job.job_title, company: company?.company_name, location: job.location || company?.location, description: job.job_description, skills: job.primary_skills, salary: job.budget_ctc, workMode: job.work_mode, employmentType: job.employment_type, experience: job.experience, postedAt: job.published_at, direct: true, verifiedCompany: company?.is_verified, applyUrl: `${siteUrl}/jobs/${job.id}` });
  const estimate = estimateSalaryRange({ title: job.job_title, location: job.location || company?.location, description: job.job_description, skills: job.primary_skills, experience: job.experience, direct: true });
  const supabase = await createServerSupabaseClient(); const { data: { user } } = await supabase.auth.getUser();
  const { data: viewer } = user ? await supabase.from("users").select("role,is_active").eq("id", user.id).maybeSingle() : { data: null };
  const applyHref = viewer?.role === "candidate" && viewer.is_active !== false ? `/candidates/jobs/${job.id}` : `/login/candidate?next=${encodeURIComponent(`/candidates/jobs/${job.id}`)}`;
  const companyName = company?.company_name || "JobiVerse hiring partner";
  const jsonLd = {
    "@context": "https://schema.org", "@type": "JobPosting", title: job.job_title,
    description: job.job_description || `Explore the ${job.job_title} role and apply through the protected JobiVerse workflow.`,
    datePosted: job.published_at || job.updated_at,
    employmentType: schemaEmploymentType(job.employment_type),
    hiringOrganization: { "@type": "Organization", name: companyName, ...(company?.website ? { sameAs: normalizeUrl(company.website) } : {}), ...(company?.logo_url ? { logo: company.logo_url } : {}) },
    ...(String(job.work_mode).toLowerCase().includes("remote") ? { jobLocationType: "TELECOMMUTE" } : { jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location || company?.location || "India", addressCountry: "IN" } } }),
    directApply: true,
    url: `${siteUrl}/jobs/${job.id}`,
  };
  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}}/><div className="mx-auto max-w-6xl">
    <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16}/>All opportunities</Link>
    <section className="relative mt-7 overflow-hidden rounded-[2.75rem] bg-[radial-gradient(circle_at_82%_15%,rgba(16,185,129,.28),transparent_24rem),linear-gradient(135deg,#09090b,#27272a)] p-8 text-white sm:p-12"><div className="relative"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-bold uppercase text-emerald-300">JobiVerse Direct</span>{company?.is_verified&&<span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-4 py-2 text-xs font-bold"><BadgeCheck size={13}/>Verified company</span>}</div><p className="mt-7 text-sm font-semibold text-zinc-300">{companyName}</p><h1 className="mt-3 max-w-5xl text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{job.job_title}</h1><p className="mt-6 flex flex-wrap gap-4 text-sm text-zinc-300"><span className="inline-flex items-center gap-2"><MapPin size={15}/>{job.location||company?.location||"India"}</span><span>{job.work_mode||"Flexible"}</span><span>{job.employment_type||"Employment type not specified"}</span></p></div></section>
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_350px]"><div className="space-y-6"><section className="rounded-[2rem] border border-zinc-200 bg-white p-7"><h2 className="text-2xl font-bold">Role overview</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Detail label="Experience" value={job.experience}/><Detail label="Openings" value={String(job.vacancies||1)}/><Detail label="Work mode" value={job.work_mode}/><Detail label="Department" value={job.department}/><Detail label="Notice period" value={job.notice_period}/><Detail label="Education" value={job.education}/></div></section><section className="rounded-[2rem] border border-zinc-200 bg-white p-7"><h2 className="text-2xl font-bold">Complete job description</h2><p className="mt-5 whitespace-pre-wrap leading-8 text-zinc-600">{job.job_description||"The employer will share additional role details during the hiring process."}</p></section><section className="rounded-[2rem] border border-zinc-200 bg-white p-7"><h2 className="text-2xl font-bold">Skills</h2><p className="mt-4 whitespace-pre-wrap rounded-2xl bg-zinc-50 p-5 leading-7 text-zinc-600">{job.primary_skills||"Skills are described in the complete job description."}</p></section><section className="rounded-[2rem] border border-zinc-200 bg-white p-7"><div className="flex items-center gap-3"><Building2/><h2 className="text-2xl font-bold">About the employer</h2></div><h3 className="mt-5 text-xl font-semibold">{companyName}</h3>{company?.description&&<p className="mt-4 leading-7 text-zinc-600">{company.description}</p>}<p className="mt-4 text-sm text-zinc-500">{company?.industry||"Industry not specified"} · {company?.company_size||"Company size not specified"}</p></section></div>
      <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start"><section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl"><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Interested?</p><Link href={applyHref} className="mt-4 flex items-center justify-between rounded-xl bg-zinc-950 px-5 py-4 font-semibold text-white">Review & apply <ArrowRight size={16}/></Link><p className="mt-3 text-xs leading-5 text-zinc-400">Job details stay public. Candidate login is required only when you apply.</p></section><section className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-950"><ShieldCheck/><p className="mt-4 text-xs font-bold uppercase tracking-wider">Opportunity Trust Score</p><p className="mt-2 text-4xl font-bold">{trust.score}<span className="text-lg">/100</span></p><p className="mt-1 font-semibold">{trust.label}</p><ul className="mt-4 space-y-2 text-xs">{trust.reasons.map(reason=><li key={reason}>• {reason}</li>)}</ul>{trust.warnings.length>0&&<p className="mt-4 text-xs text-amber-700">Review: {trust.warnings.join("; ")}</p>}</section><section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-950"><IndianRupee/><p className="mt-4 text-xs font-bold uppercase tracking-wider">Salary intelligence</p>{job.budget_ctc&&<p className="mt-3 text-sm"><strong>Employer budget:</strong> {job.budget_ctc}</p>}<p className="mt-3 text-2xl font-bold">₹{estimate.min}–{estimate.max} LPA</p><p className="mt-2 text-xs leading-5">{estimate.disclaimer}</p></section><section className="rounded-[2rem] bg-zinc-950 p-6 text-white"><Sparkles/><h2 className="mt-4 font-bold">Safe application</h2><p className="mt-2 text-sm leading-6 text-zinc-400">JobiVerse never charges candidates to apply or interview.</p><p className="mt-4 flex items-center gap-2 text-xs text-zinc-500"><CalendarDays size={13}/>Published {new Date(job.published_at||job.updated_at).toLocaleDateString("en-IN",{dateStyle:"medium"})}</p></section></aside></div>
  </div></main>;
}

function Detail({label,value}:{label:string;value?:string|null}){return <div className="rounded-xl bg-zinc-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-1 font-semibold text-zinc-700">{value||"Not specified"}</p></div>}
function normalizeUrl(value:string){return /^https?:\/\//i.test(value)?value:`https://${value}`}
function schemaEmploymentType(value?:string|null){const text=String(value||"").toLowerCase();if(text.includes("part"))return "PART_TIME";if(text.includes("contract"))return "CONTRACTOR";if(text.includes("intern"))return "INTERN";if(text.includes("temporary"))return "TEMPORARY";return "FULL_TIME"}

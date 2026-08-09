import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Rocket } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { getEmployerUpcomingInterviews, getRecruiterUpcomingInterviews } from "@/lib/hiring/interview-calendar";

type Step = { title: string; detail: string; href: string; done: boolean };

export default async function OnboardingPage() {
  const { user, profile, supabase } = await requireRole(["candidate", "employer", "recruiter", "creator"]);
  let steps: Step[] = [];

  if (profile.role === "candidate") {
    const [{ data: candidate }, { count: applications }, { count: saved }] = await Promise.all([
      supabase.from("candidate_profiles").select("headline,phone,resume_path,primary_skills,preferred_roles").eq("user_id", user.id).maybeSingle(),
      supabase.from("candidate_applications").select("id", { count: "exact", head: true }).eq("candidate_user_id", user.id),
      supabase.from("candidate_saved_jobs").select("id", { count: "exact", head: true }).eq("candidate_user_id", user.id),
    ]);
    steps = [
      { title: "Complete professional profile", detail: "Headline, phone, skills and target roles", href: "/candidates/profile", done: Boolean(candidate?.headline && candidate?.phone && candidate?.primary_skills && candidate?.preferred_roles) },
      { title: "Upload your CV", detail: "Keep an application-ready PDF", href: "/candidates/resume", done: Boolean(candidate?.resume_path) },
      { title: "Save a relevant job", detail: "Build your opportunity shortlist", href: "/jobs", done: (saved ?? 0) > 0 },
      { title: "Submit your first application", detail: "Start tracking real career movement", href: "/candidates/jobs", done: (applications ?? 0) > 0 },
    ];
  } else if (profile.role === "employer") {
    const [{ data: company }, { count: requirements }, { count: team }, interviews] = await Promise.all([
      supabase.from("companies").select("company_name,industry,location,website").eq("owner_id", user.id).maybeSingle(),
      supabase.from("requirements").select("id", { count: "exact", head: true }).eq("employer_id", user.id),
      supabase.from("employer_team_members").select("id", { count: "exact", head: true }).eq("invited_by", user.id),
      getEmployerUpcomingInterviews(user.id),
    ]);
    steps = [
      { title: "Complete company profile", detail: "Company identity, industry and location", href: "/employers/company", done: Boolean(company?.company_name && company?.industry && company?.location) },
      { title: "Create your first requirement", detail: "Publish a clear role for direct applicants", href: "/employers/requirements/new", done: (requirements ?? 0) > 0 },
      { title: "Set up your hiring team", detail: "Invite recruiters only when needed", href: "/employers/team", done: (team ?? 0) > 0 },
      { title: "Review interview calendar", detail: "Keep upcoming interviews ready for calendar export", href: "/account/calendar", done: interviews.length > 0 },
    ];
  } else if (profile.role === "recruiter") {
    const [{ count: requirements }, { count: candidates }, interviews] = await Promise.all([
      supabase.from("requirements").select("id", { count: "exact", head: true }).eq("assigned_recruiter", user.id),
      supabase.from("candidates").select("id", { count: "exact", head: true }).eq("recruiter_id", user.id),
      getRecruiterUpcomingInterviews(user.id),
    ]);
    steps = [
      { title: "Open assigned requirements", detail: "Review role context and delivery expectations", href: "/recruiter/requirements", done: (requirements ?? 0) > 0 },
      { title: "Submit your first candidate", detail: "Add a consented, relevant profile", href: "/recruiter/requirements", done: (candidates ?? 0) > 0 },
      { title: "Maintain pipeline SLA", detail: "Update active candidates within 48 hours", href: "/recruiter/candidates", done: (candidates ?? 0) > 0 },
      { title: "Review interview calendar", detail: "Keep upcoming interviews ready for calendar export", href: "/account/calendar", done: interviews.length > 0 },
    ];
  } else {
    const [{ count: services }, { data: payout }, { data: availability }] = await Promise.all([
      supabase.from("marketplace_services").select("id", { count: "exact", head: true }).eq("provider_id", user.id),
      supabase.from("creator_payout_accounts").select("id,verification_status").eq("creator_id", user.id).maybeSingle(),
      supabase.from("creator_availability").select("creator_id").eq("creator_id", user.id).maybeSingle(),
    ]);
    steps = [
      { title: "Create your first service", detail: "Publish a clear outcome and delivery promise", href: "/earn-with-jobiverse/dashboard/services/new", done: (services ?? 0) > 0 },
      { title: "Set availability", detail: "Control capacity and response expectations", href: "/earn-with-jobiverse/dashboard/availability", done: Boolean(availability) },
      { title: "Add payout profile", detail: "Prepare verified settlement details", href: "/earn-with-jobiverse/dashboard/payout-profile", done: Boolean(payout) },
      { title: "Review creator operations", detail: "Understand orders, delivery and earnings", href: "/earn-with-jobiverse/dashboard", done: (services ?? 0) > 0 },
    ];
  }

  const completed = steps.filter((step) => step.done).length;
  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="mx-auto max-w-5xl"><section className="rounded-[2.75rem] bg-zinc-950 p-8 text-white sm:p-12"><Rocket/><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">{profile.role} launch path</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">Get JobiVerse-ready.</h1><p className="mt-4 text-zinc-400">{completed} of {steps.length} essential steps complete.</p><div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${completed / steps.length * 100}%` }}/></div></section><section className="mt-7 space-y-4">{steps.map((step) => <Link key={step.title} href={step.href} className="flex items-center gap-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">{step.done ? <CheckCircle2 className="shrink-0 text-emerald-600"/> : <Circle className="shrink-0 text-zinc-300"/>}<div className="flex-1"><h2 className="font-bold">{step.title}</h2><p className="mt-1 text-sm text-zinc-500">{step.detail}</p></div><ArrowRight size={17}/></Link>)}</section></div></main>;
}

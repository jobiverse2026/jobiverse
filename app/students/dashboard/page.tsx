import Link from "next/link";
import { ArrowRight, BellRing, BookOpenCheck, BriefcaseBusiness, CalendarDays, FileText, GraduationCap, IdCard, Sparkles, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";

export default async function StudentDashboardPage() {
  const { supabase, user, profile } = await requireRole(["candidate"]);
  const [candidate, applications, saved, alerts] = await Promise.all([
    supabase.from("candidate_profiles").select("headline,primary_skills,current_location,resume_path,profile_completion").eq("user_id", user.id).maybeSingle(),
    supabase.from("candidate_applications").select("id,status", { count: "exact" }).eq("candidate_user_id", user.id).limit(5),
    supabase.from("candidate_saved_jobs").select("id", { count: "exact", head: true }).eq("candidate_user_id", user.id),
    supabase.from("candidate_job_alert_preferences").select("is_active").eq("user_id", user.id).maybeSingle(),
  ]);
  const student = candidate.data;
  const actions = [
    ["Student profile", "Add education, projects, skills and your preferred first roles.", "/students/profile", UserRound],
    ["Fresh jobs", "Explore internships, fresher roles and new opportunities.", "/students/jobs", BriefcaseBusiness],
    ["First resume", "Build and manage an ATS-ready early-career resume.", "/students/resume", FileText],
    ["Applications", "Track every application, interview and offer in one place.", "/students/applications", CalendarDays],
    ["Interview prep", "Practise common questions and create a preparation notebook.", "/students/interview-prep", BookOpenCheck],
    ["Student guide", "Learn the complete Student Universe from profile to placement.", "/guides/student", GraduationCap],
  ] as const;
  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 text-zinc-950 sm:px-8"><div className="mx-auto max-w-7xl">
    <section className="relative overflow-hidden rounded-[2.75rem] bg-zinc-950 p-8 text-white shadow-2xl sm:p-12"><div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10"/><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Student workspace</p><h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Welcome, {profile.full_name ?? "future professional"}.</h1><p className="mt-5 max-w-2xl text-zinc-300">Build proof of potential, find fresher-friendly opportunities and manage your first career moves without professional-level clutter.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/students/jobs" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-zinc-950">Explore fresh jobs <ArrowRight size={17}/></Link><Link href="/students/profile" className="rounded-2xl border border-white/15 px-6 py-4 font-bold">Complete profile</Link></div></section>
    <section className="mt-6 grid gap-4 sm:grid-cols-3"><Stat label="Applications" value={applications.count ?? 0}/><Stat label="Saved jobs" value={saved.count ?? 0}/><Stat label="Profile ready" value={`${student?.profile_completion ?? 0}%`}/></section>
    <section className="mt-8 rounded-[2rem] border border-violet-200 bg-violet-50 p-6 sm:flex sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-violet-600">Your next best step</p><h2 className="mt-2 text-2xl font-semibold">{!student?.resume_path ? "Upload your first resume" : !student?.primary_skills ? "Add your strongest skills" : !alerts.data?.is_active ? "Turn on fresher job alerts" : "Apply to a fresh opportunity"}</h2></div><Link href={!student?.resume_path ? "/students/resume" : !student?.primary_skills ? "/students/profile" : !alerts.data?.is_active ? "/candidates/job-alerts" : "/students/jobs"} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white sm:mt-0">Continue <ArrowRight size={15}/></Link></section>
    <section className="mt-10"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Your launchpad</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Everything for the first move.</h2></div><IdCard className="hidden text-zinc-300 sm:block" size={40}/></div><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{actions.map(([title,text,href,Icon])=><Link key={title} href={href} className="group rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={21}/></span><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold">Open <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span></Link>)}</div></section>
    <section className="mt-8 flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-800"><BellRing size={21}/></span><div><h2 className="font-semibold">Fresh opportunity alerts</h2><p className="mt-1 text-sm text-zinc-500">Get relevant role and location digests without repeatedly checking the site.</p></div></div><Link href="/candidates/job-alerts" className="inline-flex items-center gap-2 font-bold">Manage alerts <Sparkles size={16}/></Link></section>
  </div></main>;
}

function Stat({label,value}:{label:string;value:string|number}) { return <article className="rounded-[1.5rem] border border-zinc-200 bg-white p-6"><p className="text-sm text-zinc-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></article>; }

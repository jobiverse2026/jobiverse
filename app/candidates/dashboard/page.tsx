import Link from "next/link";
import { ArrowRight, Bookmark, BrainCircuit, BriefcaseBusiness, CalendarDays, CircleDollarSign, FileText, MapPin, Search, Sparkles, Target, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { JobiVerseCard } from "@/components/candidate/jobiverse-card";
import { OpenToWorkToggle } from "@/components/candidate/OpenToWorkToggle";
import { CareerIntelligencePanel } from "@/components/candidate/CareerIntelligencePanel";

export default async function CandidateDashboardPage({ searchParams }: { searchParams: Promise<{ visibility?: string }> }) {
  const { supabase, user, profile: userProfile } = await requireRole(["candidate"]);
  const params = await searchParams;
  const [profileResult, passportResult, itemsResult, applicationsResult, interviewsResult, offersResult, savedResult, resumeVersionsResult] = await Promise.all([
    supabase.from("candidate_profiles").select("profile_completion, headline, phone, resume_path,current_location,total_experience,primary_skills,preferred_roles,preferred_locations,role_level,industry,functional_area,work_mode,employment_type,expected_salary_min,expected_salary_max,expected_ctc,notice_period,linkedin,portfolio_url,bio,open_to_work,job_search_status,interview_availability,deal_breakers,career_wallet_notes").eq("user_id", user.id).maybeSingle(),
    supabase.from("career_passports").select("headline,summary,visibility,public_slug,open_to_opportunities").eq("user_id", user.id).maybeSingle(),
    supabase.from("career_passport_items").select("id,verification_status").eq("user_id", user.id),
    supabase.from("candidate_applications").select("id", { count: "exact", head: true }).eq("candidate_user_id", user.id),
    supabase.from("candidate_applications").select("id", { count: "exact", head: true }).eq("candidate_user_id", user.id).eq("status", "Interview"),
    supabase.from("candidate_applications").select("id", { count: "exact", head: true }).eq("candidate_user_id", user.id).eq("status", "Offered"),
    supabase.from("candidate_saved_jobs").select("id", { count: "exact", head: true }).eq("candidate_user_id", user.id),
    supabase.from("candidate_resume_versions").select("id", { count: "exact", head: true }).eq("candidate_user_id", user.id),
  ]);
  const professional = profileResult.data;
  const isOpenToWork = Boolean(professional?.open_to_work);
  const visibilityMessage = params.visibility === "open" ? "Open to work is active. Verified employers and recruiters can discover your profile." : params.visibility === "hidden" ? "Open to work is off. Your profile stays private unless you apply to a role." : null;
  const stats = [
    ["Applications", applicationsResult.count ?? 0, BriefcaseBusiness, "/candidates/applications"], ["Interviews", interviewsResult.count ?? 0, CalendarDays, "/candidates/applications"],
    ["Offers", offersResult.count ?? 0, Sparkles, "/candidates/applications"], ["Saved jobs", savedResult.count ?? 0, Bookmark, "/candidates/saved-jobs"],
  ] as const;
  return <main className="relative min-h-screen overflow-hidden bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,white,transparent_28%),radial-gradient(circle_at_88%_22%,rgba(99,102,241,.11),transparent_24%)]" /><div className="relative mx-auto max-w-7xl">
    <section className="rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-2xl sm:p-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Talent workspace</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Welcome, {userProfile.full_name ?? "Professional"}.</h1><p className="mt-5 max-w-2xl text-zinc-300">{professional?.headline ?? "Complete your professional profile to unlock smarter career opportunities."}</p></section>
    <section className="relative mt-6 overflow-hidden rounded-[2.5rem] border border-white bg-white p-6 shadow-xl sm:p-8 lg:grid lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(39,39,42,.16),transparent_65%)]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-white">
          <Search size={14} /> Main career action
        </span>
        <h2 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-.05em] text-zinc-950 sm:text-5xl">
          Explore opportunities built around your JobiVerse Card.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
          Discover active roles, save the right ones, apply with your talent profile and track every stage from one workspace.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/candidates/jobs" className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-4 font-semibold text-white transition hover:-translate-y-0.5">
            Explore Opportunities <ArrowRight size={17} />
          </Link>
          <Link href="/candidates/saved-jobs" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-4 font-semibold text-zinc-800">
            Saved Jobs <Bookmark size={17} />
          </Link>
        </div>
      </div>
      <div className="relative mt-7 rounded-[2rem] bg-zinc-950 p-6 text-white lg:mt-0">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-zinc-950"><BriefcaseBusiness size={21} /></span>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-bold uppercase text-emerald-300">Active jobs</span>
        </div>
        <h3 className="mt-6 text-2xl font-semibold">Your opportunity cockpit</h3>
        <div className="mt-5 grid gap-3 text-sm text-zinc-300">
          <p className="flex items-center gap-3"><Target size={16} className="text-zinc-500" /> Match roles with your skills and preferences</p>
          <p className="flex items-center gap-3"><MapPin size={16} className="text-zinc-500" /> Filter by location, work mode and experience</p>
          <p className="flex items-center gap-3"><CalendarDays size={16} className="text-zinc-500" /> Track application health after applying</p>
        </div>
      </div>
    </section>
    <section className="mt-6 rounded-[2rem] border border-white bg-white/90 p-5 shadow-sm backdrop-blur md:flex md:items-center md:justify-between md:gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Talent visibility</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">{isOpenToWork ? "Open to work is active" : "Open to work is off"}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Keep this on when you want verified employers and approved recruiters to discover your JobiVerse Card for relevant opportunities. Turn it off anytime to stay private except for roles you directly apply to.
        </p>
        {visibilityMessage && <p className="mt-3 text-sm font-semibold text-emerald-600">{visibilityMessage}</p>}
      </div>
      <OpenToWorkToggle initialOpen={isOpenToWork} />
    </section>
    <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, Icon, href]) => <Link href={href} key={label} className="group rounded-3xl border border-white bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><Icon className="text-zinc-400" /><p className="mt-5 text-sm text-zinc-500">{label}</p><div className="mt-2 flex items-center justify-between"><p className="text-3xl font-bold">{value}</p><ArrowRight className="text-zinc-400 transition group-hover:translate-x-1" size={18}/></div></Link>)}</section>
    <CareerIntelligencePanel profile={professional} verifiedItems={(itemsResult.data ?? []).filter((item) => item.verification_status === "verified").length} applications={applicationsResult.count ?? 0} savedJobs={savedResult.count ?? 0} resumeVersions={resumeVersionsResult.count ?? 0} />
    <section className="mt-8"><JobiVerseCard person={userProfile} profile={professional} passport={passportResult.data} items={itemsResult.data} editable /></section>
    <section className="mt-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Talent tools</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.035em]">Manage your career workspace.</h2><div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><Action href="/candidates/profile" title="Professional Profile" description="Skills, experience and career preferences" icon={UserRound} /><Action href="/candidates/resume" title="Resume Studio & Services" description="Upload, replace and view your CV | Premium templates coming soon" icon={FileText} /><Action href="/candidates/resume-analysis" title="AI Resume Analyzer | Coming Soon" description="ATS estimate and actionable CV intelligence" icon={BrainCircuit} /><Action href="/candidates/jobs" title="Explore Opportunities" description="Discover published roles matching your goals" icon={BriefcaseBusiness} /><Action href="/candidates/saved-jobs" title="Saved Jobs" description="Review saved opportunities and continue applications" icon={Bookmark}/><Action href="/candidates/applications" title="Application Health" description="Track submitted applications, interviews and offers" icon={CalendarDays}/><Action href="/earn-with-jobiverse/dashboard" title="Earn with JobiVerse" description="Create offerings and track sales, earnings and payouts" icon={CircleDollarSign} /></div></section>
  </div></main>;
}

function Action({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: typeof UserRound }) {
  return <Link href={href} className="group rounded-3xl border border-white bg-white/90 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={21} /></span><h2 className="mt-6 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-500">{description}</p><span className="mt-6 flex items-center gap-2 text-sm font-semibold">Open <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span></Link>;
}

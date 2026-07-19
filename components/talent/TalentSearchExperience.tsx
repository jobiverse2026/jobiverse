import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Crown, LockKeyhole, MapPin, Search, ShieldCheck, SlidersHorizontal, UsersRound } from "lucide-react";

import { adminSupabase } from "@/lib/supabase/admin";

type TalentRole = "employer" | "recruiter";
type SearchParams = {
  q?: string;
  location?: string;
  skills?: string;
  roleLevel?: string;
  industry?: string;
  workMode?: string;
  employmentType?: string;
  status?: string;
};

const roleLevels = ["Fresher", "Junior", "Mid-level", "Senior", "Lead", "Manager", "Leadership"];
const workModes = ["On-site", "Hybrid", "Remote"];
const employmentTypes = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const statuses = [
  ["", "Any open candidate"],
  ["actively_looking", "Actively looking"],
  ["open_to_offers", "Open to offers"],
] as const;

export async function TalentSearchExperience({ role, userId, userEmail, searchParams }: { role: TalentRole; userId: string; userEmail: string; searchParams: SearchParams }) {
  const access = role === "recruiter" ? { allowed: true, reason: "Internal recruiter access" } : await getEmployerTalentSearchAccess(userId, userEmail);
  const canUnlock = access.allowed;
  const queryText = clean(searchParams.q);
  const location = clean(searchParams.location);
  const skills = clean(searchParams.skills);

  let query = adminSupabase
    .from("candidate_profiles")
    .select("user_id,headline,current_location,total_experience,current_company,expected_ctc,notice_period,primary_skills,secondary_skills,preferred_locations,preferred_roles,bio,open_to_work,job_search_status,role_level,industry,functional_area,highest_education,employment_type,work_mode,expected_salary_min,expected_salary_max,updated_at,users(full_name,avatar_url)")
    .eq("open_to_work", true)
    .order("updated_at", { ascending: false })
    .limit(60);

  if (searchParams.roleLevel) query = query.eq("role_level", searchParams.roleLevel);
  if (searchParams.industry) query = query.ilike("industry", `%${searchParams.industry}%`);
  if (searchParams.workMode) query = query.eq("work_mode", searchParams.workMode);
  if (searchParams.employmentType) query = query.eq("employment_type", searchParams.employmentType);
  if (searchParams.status) query = query.eq("job_search_status", searchParams.status);
  if (location) query = query.or(`current_location.ilike.%${escapeFilter(location)}%,preferred_locations.ilike.%${escapeFilter(location)}%`);
  if (skills) query = query.or(`primary_skills.ilike.%${escapeFilter(skills)}%,secondary_skills.ilike.%${escapeFilter(skills)}%,searchable_keywords.ilike.%${escapeFilter(skills)}%`);
  if (queryText) {
    const value = escapeFilter(queryText);
    query = query.or(`headline.ilike.%${value}%,preferred_roles.ilike.%${value}%,primary_skills.ilike.%${value}%,functional_area.ilike.%${value}%,searchable_keywords.ilike.%${value}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const candidates = data ?? [];
  const visibleCandidates = canUnlock ? candidates : candidates.slice(0, 8);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,white,transparent_28%),radial-gradient(circle_at_88%_22%,rgba(24,24,27,.12),transparent_24%)]" />
      <div className="relative mx-auto max-w-[1450px]">
        <section className="overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-2xl sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">JobiVerse Talent Search</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Search open-to-work talent.</h1>
              <p className="mt-5 max-w-3xl text-zinc-300">
                Discover candidates who have chosen to be visible to hiring teams. Search by skills, role, location, work mode and hiring readiness.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"><ShieldCheck size={15} /> Consent-based discovery</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"><BadgeCheck size={15} /> JobiVerse protected contact flow</span>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Open profiles found</p>
                  <p className="mt-1 text-5xl font-semibold">{candidates.length}</p>
                </div>
                <UsersRound size={48} className="text-zinc-500" />
              </div>
              {!canUnlock && (
                <div className="mt-6 rounded-2xl bg-white p-5 text-zinc-950">
                  <div className="flex items-center gap-3">
                    <LockKeyhole size={19} />
                    <p className="font-semibold">Paid access locked</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{access.reason || "Activate Talent Search to unlock full profiles, shortlist support and JobiVerse-assisted contact."}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <SlidersHorizontal />
            <div>
              <h2 className="text-2xl font-semibold">Search filters</h2>
              <p className="text-sm text-zinc-500">Filters mirror the details candidates provide while completing their profile.</p>
            </div>
          </div>
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Role, keyword or title" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500" />
            <input name="skills" defaultValue={searchParams.skills ?? ""} placeholder="Skills e.g. React, Sales, Excel" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500" />
            <input name="location" defaultValue={searchParams.location ?? ""} placeholder="Location e.g. Mumbai, Remote" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500" />
            <input name="industry" defaultValue={searchParams.industry ?? ""} placeholder="Industry" className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500" />
            <select name="roleLevel" defaultValue={searchParams.roleLevel ?? ""} className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500">
              <option value="">Any role level</option>
              {roleLevels.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select name="workMode" defaultValue={searchParams.workMode ?? ""} className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500">
              <option value="">Any work mode</option>
              {workModes.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select name="employmentType" defaultValue={searchParams.employmentType ?? ""} className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500">
              <option value="">Any employment type</option>
              {employmentTypes.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select name="status" defaultValue={searchParams.status ?? ""} className="h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500">
              {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white xl:col-span-2">
              <Search size={16} /> Search talent
            </button>
            <Link href={role === "employer" ? "/employers/talent-search" : "/recruiter/talent-search"} className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold xl:col-span-2">Clear filters</Link>
          </form>
        </section>

        {!canUnlock && (
          <section className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-7">
              <div className="flex items-center gap-3">
                <Crown className="text-amber-700" />
                <h2 className="text-2xl font-semibold text-amber-950">Talent Search is a premium employer service.</h2>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-900">
                You can preview talent supply now. Full profile visibility, shortlist actions and contact coordination unlock for the employer owner and invited company recruiters after active Talent Search access.
              </p>
            </div>
            <Link href="/plans" className="group flex items-center justify-between gap-4 rounded-[2rem] bg-zinc-950 p-7 text-white transition hover:-translate-y-1 hover:shadow-2xl">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Upgrade</p>
                <h3 className="mt-2 text-2xl font-semibold">Request Talent Search Access</h3>
                <p className="mt-2 text-sm text-zinc-400">Paid monthly plan. Admin approval required.</p>
              </div>
              <ArrowRight className="transition group-hover:translate-x-1" />
            </Link>
          </section>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleCandidates.length ? visibleCandidates.map((candidate, index) => <TalentCard key={candidate.user_id} candidate={candidate} locked={!canUnlock} index={index} />) : (
            <div className="col-span-full rounded-[2rem] border border-dashed border-zinc-300 bg-white p-14 text-center">
              <UsersRound className="mx-auto text-zinc-300" size={42} />
              <h2 className="mt-5 text-2xl font-semibold">No open-to-work profiles found</h2>
              <p className="mt-2 text-sm text-zinc-500">Try broader filters or invite candidates to complete their JobiVerse profile.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function TalentCard({ candidate, locked, index }: { candidate: any; locked: boolean; index: number }) {
  const person = Array.isArray(candidate.users) ? candidate.users[0] : candidate.users;
  const displayName = locked ? `Candidate JV-${String(index + 1).padStart(3, "0")}` : person?.full_name ?? "JobiVerse Candidate";
  const initials = displayName.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <article className={`relative overflow-hidden rounded-[2rem] border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${locked ? "border-zinc-200" : "border-emerald-200"}`}>
      {locked && <div className="absolute right-5 top-5 rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Locked</div>}
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-zinc-950 font-semibold text-white">{initials}</div>
        <div className="min-w-0 pr-16">
          <h3 className="truncate text-xl font-semibold">{displayName}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{candidate.headline || candidate.preferred_roles || "Open-to-work professional"}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">{statusLabel(candidate.job_search_status)}</span>
        {candidate.role_level && <span className="rounded-full bg-zinc-100 px-3 py-1 font-semibold text-zinc-700">{candidate.role_level}</span>}
        {candidate.work_mode && <span className="rounded-full bg-zinc-100 px-3 py-1 font-semibold text-zinc-700">{candidate.work_mode}</span>}
      </div>
      <div className="mt-6 space-y-3 border-t border-zinc-100 pt-5 text-sm text-zinc-600">
        <p className="flex items-center gap-2"><BriefcaseBusiness size={15} /> {candidate.total_experience || "Experience not specified"} {candidate.functional_area ? `| ${candidate.functional_area}` : ""}</p>
        <p className="flex items-center gap-2"><MapPin size={15} /> {candidate.current_location || candidate.preferred_locations || "Location not specified"}</p>
        <p className="line-clamp-2">{candidate.primary_skills || "Skills not specified"}</p>
        <p className="text-xs text-zinc-400">{salaryLabel(candidate.expected_salary_min, candidate.expected_salary_max, candidate.expected_ctc)}</p>
      </div>
      <div className={`mt-6 rounded-2xl p-4 text-sm leading-6 ${locked ? "bg-zinc-50 text-zinc-500 blur-[1px] select-none" : "bg-emerald-50 text-emerald-900"}`}>
        {candidate.bio || "Detailed profile notes, resume visibility and contact coordination are available after access approval."}
      </div>
      <button disabled className={`mt-6 w-full rounded-2xl px-5 py-3.5 text-sm font-semibold ${locked ? "bg-zinc-100 text-zinc-400" : "bg-zinc-950 text-white"}`}>
        {locked ? "Unlock via Talent Search plan" : "Shortlist through JobiVerse"}
      </button>
    </article>
  );
}

async function getEmployerTalentSearchAccess(userId: string, _email: string) {
  const { data: company } = await adminSupabase
    .from("companies")
    .select("id,is_verified,company_email,owner_id")
    .eq("owner_id", userId)
    .maybeSingle();

  let accessCompany = company;
  let billingEmployerId = userId;

  if (!accessCompany) {
    const { data: membership } = await adminSupabase
      .from("employer_team_members")
      .select("employer_id,companies(id,is_verified,owner_id,company_email)")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    const memberCompany = Array.isArray(membership?.companies) ? membership?.companies[0] : membership?.companies;
    if (membership?.employer_id && memberCompany) {
      billingEmployerId = membership.employer_id;
      accessCompany = memberCompany;
    }
  }

  if (!accessCompany) return { allowed: false, reason: "Complete your company profile or accept an employer team invite before requesting Talent Search access." };
  if (!accessCompany.is_verified) return { allowed: false, reason: "This company needs JobiVerse verification before full Talent Search access." };

  const { data } = await adminSupabase
    .from("platform_subscriptions")
    .select("id,platform_plans!inner(slug)")
    .eq("user_id", billingEmployerId)
    .eq("status", "active")
    .in("platform_plans.slug", ["employer-talent-search", "employer-enterprise"])
    .maybeSingle();

  if (!data) return { allowed: false, reason: "Talent Search is locked until an active employer Talent Search plan is approved." };
  return { allowed: true, reason: "Approved employer team with active Talent Search access." };
}

function clean(value?: string) {
  return String(value ?? "").trim();
}

function escapeFilter(value: string) {
  return value.replaceAll("%", "\\%").replaceAll(",", " ");
}

function statusLabel(value?: string) {
  if (value === "actively_looking") return "Actively looking";
  if (value === "open_to_offers") return "Open to offers";
  return "Open to work";
}

function salaryLabel(min?: number | null, max?: number | null, fallback?: string | null) {
  if (min && max) return `Expected ₹${Number(min).toLocaleString("en-IN")} - ₹${Number(max).toLocaleString("en-IN")} / year`;
  if (min) return `Expected from ₹${Number(min).toLocaleString("en-IN")} / year`;
  if (max) return `Expected up to ₹${Number(max).toLocaleString("en-IN")} / year`;
  return fallback ? `Expected ${fallback}` : "Salary expectation not specified";
}

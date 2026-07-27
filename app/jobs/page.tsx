import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ExternalLink,
  Globe2,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { plainTextSnippet, searchJoobleJobs } from "@/lib/jobs/jooble";
import { adminSupabase } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Jobs in India | JobiVerse",
  description: "Explore direct JobiVerse employer opportunities and clearly attributed partner jobs across India.",
};

type SearchParams = Promise<{
  q?: string;
  location?: string;
  page?: string;
  source?: string;
  radius?: string;
  searchIn?: string;
  jobType?: string;
  workMode?: string;
  freshness?: string;
}>;

const popularCities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Noida", "Gurugram"];
const allowedRadii = new Set(["0", "4", "8", "16", "26", "40", "80"]);
const allowedJobTypes = new Set(["full-time", "part-time", "contract", "internship"]);
const allowedWorkModes = new Set(["remote", "hybrid", "on-site"]);
const allowedFreshness = new Set(["1", "3", "7", "30"]);

export default async function PublicJobsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  const query = (filters.q ?? "").trim();
  const location = (filters.location ?? "India").trim() || "India";
  const page = Math.max(1, Number.parseInt(filters.page ?? "1", 10) || 1);
  const source = filters.source === "jobiverse" ? "jobiverse" : filters.source === "partner" ? "partner" : "all";
  const searchIn = filters.searchIn === "company" ? "company" : "role";
  const jobType = allowedJobTypes.has(filters.jobType ?? "") ? filters.jobType! : "";
  const workMode = allowedWorkModes.has(filters.workMode ?? "") ? filters.workMode! : "";
  const freshness = allowedFreshness.has(filters.freshness ?? "") ? filters.freshness! : "";
  const requestedRadius = allowedRadii.has(filters.radius ?? "") ? filters.radius! as "0" | "4" | "8" | "16" | "26" | "40" | "80" : undefined;
  const radius = filters.radius === "all" ? undefined : requestedRadius ?? (location.toLowerCase() === "india" ? undefined : "40");

  const [partner, directResult] = await Promise.all([
    source === "jobiverse"
      ? Promise.resolve({ configured: Boolean(process.env.JOOBLE_API_KEY), totalCount: 0, jobs: [], error: undefined, locationMatchedByText: false })
      : searchJoobleJobs({ keywords: query, location, page, resultsPerPage: 20, radius, companySearch: searchIn === "company" }),
    source === "partner"
      ? Promise.resolve({ data: [], error: null })
      : adminSupabase
          .from("requirements")
          .select("id,job_title,department,employment_type,work_mode,experience,vacancies,location,primary_skills,published_at,company_id,employer_id,companies(company_name,is_verified,industry,location)")
          .eq("is_public", true)
          .not("status", "in", '("Closed","Cancelled")')
          .order("published_at", { ascending: false })
          .limit(30),
  ]);

  const directRows = directResult.data ?? [];
  const ownerIds = Array.from(new Set(directRows.filter((job) => !job.companies?.[0] && job.employer_id).map((job) => job.employer_id)));
  const { data: ownerCompanies } = ownerIds.length
    ? await adminSupabase.from("companies").select("owner_id,company_name,is_verified,industry,location").in("owner_id", ownerIds)
    : { data: [] };
  const ownerCompanyMap = new Map((ownerCompanies ?? []).map((company) => [company.owner_id, company]));
  const directJobs = directRows.filter((job) => {
    const company = job.companies?.[0] ?? ownerCompanyMap.get(job.employer_id);
    const searchable = searchIn === "company"
      ? [company?.company_name, company?.industry].filter(Boolean).join(" ").toLowerCase()
      : [job.job_title, job.department, job.primary_skills].filter(Boolean).join(" ").toLowerCase();
    const jobLocation = (job.location || company?.location || "India").toLowerCase();
    return (!query || searchable.includes(query.toLowerCase()))
      && (location.toLowerCase() === "india" || jobLocation.includes(location.toLowerCase()))
      && (!jobType || matchesType(job.employment_type ?? "", jobType))
      && (!workMode || matchesWorkMode(job.work_mode ?? "", workMode))
      && (!freshness || isFreshEnough(job.published_at, Number(freshness)));
  });

  const partnerJobs = partner.jobs.filter((job) => {
    const searchable = searchIn === "company" ? job.company : `${job.title} ${job.snippet}`;
    return (!query || searchable.toLowerCase().includes(query.toLowerCase()))
      && (!jobType || matchesType(job.type, jobType))
      && (!workMode || matchesWorkMode(`${job.type} ${job.snippet}`, workMode))
      && (!freshness || isFreshEnough(job.updated, Number(freshness)));
  });
  const hasAdvancedFilters = Boolean(jobType || workMode || freshness);
  const partnerVisibleCount = hasAdvancedFilters || partner.locationMatchedByText ? partnerJobs.length : partner.totalCount;
  const visibleCount = directJobs.length + partnerVisibleCount;
  const countLabel = visibleCount.toLocaleString("en-IN");

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-[1450px]">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16} />Main site</Link>

        <section className="relative mt-7 overflow-hidden rounded-[3rem] bg-[radial-gradient(circle_at_78%_18%,rgba(99,102,241,.34),transparent_28rem),linear-gradient(135deg,#09090b,#18181b_58%,#3f3f46)] px-7 py-12 text-white shadow-[0_35px_100px_-48px_rgba(0,0,0,.85)] sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute -right-24 -top-32 h-[440px] w-[620px] rounded-[50%] border border-white/10" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-200"><Sparkles size={14} />Opportunity Universe</span>
              <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-[-.055em] sm:text-7xl">Real opportunities. Clear sources. One place to begin.</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">Explore roles published directly by JobiVerse employers alongside licensed partner listings. Every partner role remains clearly attributed and takes you to its original application destination.</p>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/[.08] p-6 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Available in this search</p>
              <p className="mt-3 text-5xl font-semibold">{countLabel}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">Live count comes from current JobiVerse roles and the connected partner feed—never from fabricated listings.</p>
            </div>
          </div>
        </section>

        <form action="/jobs" className="relative -mt-5 mx-auto max-w-6xl rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-xl">
          <div className="grid gap-3 md:grid-cols-[1fr_260px_190px_auto]">
            <label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} /><span className="sr-only">Search roles</span><input name="q" defaultValue={query} placeholder={searchIn === "company" ? "Search company" : "Role or skill"} className="h-13 w-full rounded-xl border border-zinc-200 pl-12 pr-4 outline-none focus:border-zinc-500" /></label>
            <label className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} /><span className="sr-only">City or location</span><input name="location" list="job-cities" defaultValue={location} placeholder="City or location" className="h-13 w-full rounded-xl border border-zinc-200 pl-12 pr-4 outline-none focus:border-zinc-500" /><datalist id="job-cities">{popularCities.map((city) => <option key={city} value={city} />)}</datalist></label>
            <label><span className="sr-only">Job source</span><select name="source" defaultValue={source} className="h-13 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 outline-none"><option value="all">All opportunities</option><option value="jobiverse">JobiVerse direct</option><option value="partner">Partner jobs</option></select></label>
            <button className="h-13 cursor-pointer rounded-xl bg-zinc-950 px-7 font-semibold text-white">Search jobs</button>
          </div>

          <details className="group mt-3 rounded-2xl border border-zinc-100 bg-zinc-50/80" open={hasAdvancedFilters || Boolean(filters.radius) || searchIn === "company"}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-zinc-700">
              <span className="flex items-center gap-2"><SlidersHorizontal size={16} />More filters</span>
              <ChevronDown size={16} className="transition group-open:rotate-180" />
            </summary>
            <div className="grid gap-3 border-t border-zinc-200 p-4 sm:grid-cols-2 lg:grid-cols-5">
              <FilterSelect name="searchIn" label="Search in" value={searchIn} options={[["role", "Role & skills"], ["company", "Company name"]]} />
              <FilterSelect name="radius" label="Distance" value={filters.radius === "all" ? "all" : radius ?? "all"} options={[["all", "Any distance"], ["0", "Exact location"], ["26", "Within 26 km"], ["40", "Within 40 km"], ["80", "Within 80 km"]]} />
              <FilterSelect name="jobType" label="Employment" value={jobType} options={[["", "All job types"], ["full-time", "Full-time"], ["part-time", "Part-time"], ["contract", "Contract"], ["internship", "Internship"]]} />
              <FilterSelect name="workMode" label="Work mode" value={workMode} options={[["", "All work modes"], ["remote", "Remote"], ["hybrid", "Hybrid"], ["on-site", "On-site"]]} />
              <FilterSelect name="freshness" label="Posted" value={freshness} options={[["", "Any time"], ["1", "Last 24 hours"], ["3", "Last 3 days"], ["7", "Last 7 days"], ["30", "Last 30 days"]]} />
            </div>
          </details>

          <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
            <span className="text-xs font-bold uppercase tracking-[.14em] text-zinc-400">Popular cities</span>
            {popularCities.map((city) => <Link key={city} href={locationHref(filters, city)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${location.toLowerCase() === city.toLowerCase() ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}>{city}</Link>)}
          </div>
        </form>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><BadgeCheck className="mt-0.5 shrink-0" /><div><h2 className="font-bold">JobiVerse Direct</h2><p className="mt-1 text-sm leading-6">Published by an employer inside JobiVerse. Sign in to view, save and apply through the protected JobiVerse workflow.</p></div></div>
          <div className="flex items-start gap-4 rounded-3xl border border-violet-200 bg-violet-50 p-5 text-violet-950"><Globe2 className="mt-0.5 shrink-0" /><div><h2 className="font-bold">Partner Opportunity</h2><p className="mt-1 text-sm leading-6">Supplied by a licensed job-search partner. Application happens on the original destination; JobiVerse does not charge a placement fee for it.</p></div></div>
        </section>

        {source !== "partner" && directJobs.length > 0 && (
          <section className="mt-12">
            <SectionHeading eyebrow="Direct employer roles" title="Apply through JobiVerse" count={directJobs.length} />
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {directJobs.map((job) => {
                const company = job.companies?.[0] ?? ownerCompanyMap.get(job.employer_id);
                return <article key={job.id} className="flex flex-col rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><BriefcaseBusiness size={20} /></span><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">JobiVerse Direct</span></div>
                  <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-zinc-600"><Building2 size={15} />{company?.company_name || "JobiVerse hiring partner"}{company?.is_verified && <BadgeCheck size={15} className="text-emerald-600" />}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">{job.job_title}</h2>
                  <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500"><MapPin size={15} />{job.location || company?.location || "India"}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2 text-xs"><Essential label="Experience" value={job.experience || "Open"} /><Essential label="Work mode" value={job.work_mode || "Flexible"} /></div>
                  <p className="mt-5 line-clamp-2 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">{job.primary_skills || "Open the role to review its complete requirements."}</p>
                  <Link href={`/login/candidate?next=${encodeURIComponent(`/candidates/jobs/${job.id}`)}`} className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-5 text-sm font-semibold">Sign in to view & apply <ArrowRight size={16} /></Link>
                </article>;
              })}
            </div>
          </section>
        )}

        {source !== "jobiverse" && (
          <section className="mt-14">
            <SectionHeading eyebrow="Licensed discovery feed" title="Partner opportunities" count={partnerVisibleCount} />
            {partner.locationMatchedByText && <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">The partner feed did not provide structured city results, so these opportunities were matched from city references inside the original listing. Open the source listing to confirm the exact work location.</p>}
            {!partner.configured ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center"><Globe2 className="mx-auto text-zinc-400" /><h3 className="mt-4 text-2xl font-semibold">Partner network is being connected</h3><p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-500">JobiVerse will show licensed, attributed opportunities here after the provider connection is activated.</p></div>
            ) : partner.error ? (
              <div className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-amber-950"><h3 className="font-bold">Partner feed needs attention</h3><p className="mt-2 text-sm">{partner.error} JobiVerse direct roles remain available above.</p></div>
            ) : partnerJobs.length ? (
              <>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {partnerJobs.map((job) => <article key={`jooble-${job.id}`} className="flex flex-col rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-950 text-white"><Globe2 size={20} /></span><span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase text-violet-700">Partner Job</span></div>
                    <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-zinc-600"><Building2 size={15} />{job.company}</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{job.title}</h2>
                    <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500"><MapPin size={15} />{partnerLocationLabel(job.location, location, Boolean(partner.locationMatchedByText))}</p>
                    <div className="mt-5 grid grid-cols-2 gap-2 text-xs"><Essential label="Type" value={job.type || "Not specified"} /><Essential label="Salary" value={job.salary || "Not disclosed"} /></div>
                    <p className="mt-5 line-clamp-3 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">{plainTextSnippet(job.snippet) || "Open the original listing to review complete role details."}</p>
                    <p className="mt-4 text-xs text-zinc-400">Source: {job.source || "Jooble"}{job.updated ? ` · Updated ${formatDate(job.updated)}` : ""}</p>
                    <a href={job.link} target="_blank" rel="nofollow sponsored noreferrer" className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-5 text-sm font-semibold">View original listing <ExternalLink size={16} /></a>
                  </article>)}
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4"><a href="https://jooble.org" target="_blank" rel="nofollow sponsored noreferrer" className="text-sm font-bold text-violet-800">Jobs powered by Jooble <ExternalLink className="ml-1 inline" size={13} /></a><div className="flex gap-2">{page > 1 && <Link href={pageHref(filters, page - 1)} className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold">Previous</Link>}{partner.jobs.length === 20 && <Link href={pageHref(filters, page + 1)} className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">Next page</Link>}</div></div>
              </>
            ) : (
              <div className="mt-6 rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center"><Search className="mx-auto text-zinc-400" /><h3 className="mt-4 text-2xl font-semibold">No partner jobs matched this search</h3><p className="mt-2 text-zinc-500">Try a broader role keyword or use India as the location.</p></div>
            )}
          </section>
        )}

        <section className="mt-14 grid gap-5 rounded-[2.5rem] bg-zinc-950 p-8 text-white lg:grid-cols-[1fr_auto] lg:items-center sm:p-10">
          <div className="flex items-start gap-4"><ShieldCheck className="mt-1 shrink-0 text-emerald-300" /><div><h2 className="text-2xl font-semibold">Safe opportunity discovery</h2><p className="mt-2 max-w-4xl text-sm leading-7 text-zinc-400">Never pay anyone to apply or interview. Verify the employer and destination before sharing personal data. Partner listings belong to their original publishers and may change or expire outside JobiVerse.</p></div></div>
          <Link href="/signup?role=candidate" className="inline-flex min-h-13 items-center justify-center rounded-xl bg-white px-6 font-semibold text-zinc-950">Build your free JobiVerse profile</Link>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, count }: { eyebrow: string; title: string; count: number }) {
  return <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">{eyebrow}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">{title}</h2></div><span className="rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">{count.toLocaleString("en-IN")} available</span></div>;
}

function Essential({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-zinc-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-1 line-clamp-2 font-semibold text-zinc-700">{value}</p></div>;
}

function FilterSelect({ name, label, value, options }: { name: string; label: string; value: string; options: [string, string][] }) {
  return <label className="text-xs font-bold uppercase tracking-[.12em] text-zinc-400">{label}<select name={name} defaultValue={value} className="mt-2 h-11 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-zinc-700 outline-none focus:border-zinc-500">{options.map(([optionValue, optionLabel]) => <option key={`${name}-${optionValue || "all"}`} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "recently" : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(date);
}

function partnerLocationLabel(jobLocation: string, searchedLocation: string, matchedByText: boolean) {
  const providerLocation = jobLocation.trim();
  const normalizedProviderLocation = providerLocation.toLowerCase();
  const normalizedSearchLocation = searchedLocation.trim().toLowerCase();
  const isGenericProviderLocation = !providerLocation || normalizedProviderLocation === "india" || normalizedProviderLocation === "not specified";

  if (normalizedSearchLocation !== "india" && isGenericProviderLocation) {
    return `${searchedLocation} · ${matchedByText ? "matched from listing" : "search location"}`;
  }

  return providerLocation || "India";
}

function pageHref(filters: Awaited<SearchParams>, page: number) {
  const params = new URLSearchParams();
  for (const key of ["q", "location", "source", "radius", "searchIn", "jobType", "workMode", "freshness"] as const) {
    if (filters[key]) params.set(key, filters[key]!);
  }
  params.set("page", String(page));
  return `/jobs?${params.toString()}`;
}

function locationHref(filters: Awaited<SearchParams>, city: string) {
  const params = new URLSearchParams();
  for (const key of ["q", "source", "searchIn", "jobType", "workMode", "freshness"] as const) {
    if (filters[key]) params.set(key, filters[key]!);
  }
  params.set("location", city);
  params.set("radius", "40");
  return `/jobs?${params.toString()}`;
}

function normalizeFilterValue(value: string) {
  return value.toLowerCase().replace(/[_\s]+/g, "-").replace(/[^a-z-]/g, "");
}

function matchesType(value: string, expected: string) {
  const normalized = normalizeFilterValue(value);
  if (expected === "full-time") return normalized.includes("full-time") || normalized === "fulltime";
  if (expected === "part-time") return normalized.includes("part-time") || normalized === "parttime";
  return normalized.includes(expected);
}

function matchesWorkMode(value: string, expected: string) {
  const normalized = normalizeFilterValue(value);
  if (expected === "on-site") return normalized.includes("on-site") || normalized.includes("onsite") || normalized.includes("office");
  return normalized.includes(expected);
}

function isFreshEnough(value: string | null | undefined, days: number) {
  if (!value) return false;
  const postedAt = new Date(value).getTime();
  return Number.isFinite(postedAt) && postedAt >= Date.now() - days * 86_400_000;
}

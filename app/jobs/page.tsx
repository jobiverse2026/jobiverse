import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BellRing,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ExternalLink,
  Globe2,
  Flame,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { JobMatchBadge } from "@/components/candidate/JobMatchBadge";
import { SaveSearchControl } from "@/components/candidate/SaveSearchControl";

import {
  plainTextSnippet,
  searchJoobleJobs,
  type PartnerJob,
  type PartnerJobSearch,
} from "@/lib/jobs/jooble";
import {
  searchAdzunaJobs,
  searchArbeitnowJobs,
  searchHimalayasJobs,
  searchJobicyJobs,
  searchMuseJobs,
  searchRemotiveJobs,
} from "@/lib/jobs/partner-sources";
import { getJobSector, JOB_SECTORS, matchesJobSector, sectorSearchKeywords } from "@/lib/jobs/sectors";
import { calculateListingMatch, calculateOpportunityTrust, estimateSalaryRange, freshnessLabel, isStaleListing, listingKey } from "@/lib/jobs/intelligence";
import { JobCompareButton } from "@/components/jobs/JobCompareButton";
import { JobCompareTray } from "@/components/jobs/JobCompareTray";
import { adminSupabase } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  sector?: string;
}>;

const popularCities = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Noida", "Gurugram"];
const partnerLocationAliases = [
  { label: "Mumbai", aliases: ["mumbai", "bombay"] },
  { label: "Navi Mumbai", aliases: ["navi mumbai"] },
  { label: "Thane", aliases: ["thane"] },
  { label: "Delhi NCR", aliases: ["delhi ncr", "new delhi", "delhi", "noida", "gurugram", "gurgaon"] },
  { label: "Noida", aliases: ["noida"] },
  { label: "Gurugram", aliases: ["gurugram", "gurgaon"] },
  { label: "Bengaluru", aliases: ["bengaluru", "bangalore"] },
  { label: "Hyderabad", aliases: ["hyderabad"] },
  { label: "Pune", aliases: ["pune"] },
  { label: "Chennai", aliases: ["chennai"] },
  { label: "Kolkata", aliases: ["kolkata", "calcutta"] },
  { label: "Ahmedabad", aliases: ["ahmedabad"] },
  { label: "Jaipur", aliases: ["jaipur"] },
  { label: "Kochi", aliases: ["kochi", "cochin"] },
  { label: "Chandigarh", aliases: ["chandigarh"] },
  { label: "Indore", aliases: ["indore"] },
  { label: "Lucknow", aliases: ["lucknow"] },
  { label: "Bhubaneswar", aliases: ["bhubaneswar"] },
  { label: "Nagpur", aliases: ["nagpur"] },
  { label: "Coimbatore", aliases: ["coimbatore"] },
] as const;
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
  const sector = getJobSector(filters.sector)?.value ?? "";
  const partnerKeywords = searchIn === "company" ? query : sectorSearchKeywords(query, sector);
  const requestedRadius = allowedRadii.has(filters.radius ?? "") ? filters.radius! as "0" | "4" | "8" | "16" | "26" | "40" | "80" : undefined;
  const radius = filters.radius === "all" ? undefined : requestedRadius ?? (location.toLowerCase() === "india" ? undefined : "40");

  const [partner, directResult, viewer] = await Promise.all([
    source === "jobiverse"
      ? Promise.resolve<PartnerJobSearch>({ configured: true, totalCount: 0, jobs: [], nationalFeed: false })
      : discoverPartnerJobs({ keywords: partnerKeywords, location, page, radius, companySearch: searchIn === "company" }),
    source === "partner"
      ? Promise.resolve({ data: [], error: null })
      : adminSupabase
          .from("requirements")
          .select("id,job_title,department,employment_type,work_mode,experience,vacancies,location,primary_skills,job_description,budget_ctc,published_at,company_id,employer_id,companies(company_name,is_verified,industry,location)")
          .eq("is_public", true)
          .not("status", "in", '("Closed","Cancelled")')
          .order("published_at", { ascending: false })
          .limit(30),
    getJobsViewer(),
  ]);

  const directRows = directResult.data ?? [];
  const ownerIds = Array.from(new Set(directRows.filter((job) => !job.companies?.[0] && job.employer_id).map((job) => job.employer_id)));
  const { data: ownerCompanies } = ownerIds.length
    ? await adminSupabase.from("companies").select("owner_id,company_name,is_verified,industry,location").in("owner_id", ownerIds)
    : { data: [] };
  const ownerCompanyMap = new Map((ownerCompanies ?? []).map((company) => [company.owner_id, company]));
  const directJobsFiltered = directRows.filter((job) => {
    const company = job.companies?.[0] ?? ownerCompanyMap.get(job.employer_id);
    const searchable = searchIn === "company"
      ? [company?.company_name, company?.industry].filter(Boolean).join(" ").toLowerCase()
      : [job.job_title, job.department, job.primary_skills].filter(Boolean).join(" ").toLowerCase();
    const jobLocation = (job.location || company?.location || "India").toLowerCase();
    return (!query || searchable.includes(query.toLowerCase()))
      && matchesJobSector(`${job.job_title} ${job.department ?? ""} ${job.primary_skills ?? ""} ${company?.industry ?? ""}`, sector)
      && (location.toLowerCase() === "india" || jobLocation.includes(location.toLowerCase()))
      && (!jobType || matchesType(job.employment_type ?? "", jobType))
      && (!workMode || matchesWorkMode(job.work_mode ?? "", workMode))
      && (!freshness || isFreshEnough(job.published_at, Number(freshness)));
  });

  const directKeys = new Set(directJobsFiltered.map((job) => {
    const company = job.companies?.[0] ?? ownerCompanyMap.get(job.employer_id);
    return listingKey(job.job_title, company?.company_name ?? "", job.location ?? company?.location ?? "India");
  }));
  const partnerJobsFiltered = partner.jobs.filter((job) => {
    const searchable = searchIn === "company" ? job.company : `${job.title} ${job.snippet}`;
    return (!query || searchable.toLowerCase().includes(query.toLowerCase()))
      && matchesJobSector(`${job.title} ${job.type} ${job.snippet} ${job.company}`, sector)
      && (!jobType || matchesType(job.type, jobType))
      && (!workMode || matchesWorkMode(`${job.type} ${job.snippet}`, workMode))
      && (!freshness || isFreshEnough(job.updated, Number(freshness)))
      && !isStaleListing(job.updated)
      && !directKeys.has(listingKey(job.title, job.company, job.location));
  });
  const directJobs = directJobsFiltered.map((job) => ({ job, match: calculateListingMatch(viewer.profile, {
    title: job.job_title, skills: job.primary_skills, location: job.location, workMode: job.work_mode,
    employmentType: job.employment_type, experience: job.experience,
  })})).sort((a,b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
  const partnerJobs = partnerJobsFiltered.map((job) => ({ job, match: calculateListingMatch(viewer.profile, {
    title: job.title, skills: job.snippet, location: job.location, workMode: job.type,
    employmentType: job.type, description: job.snippet,
  })})).sort((a,b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
  const hasAdvancedFilters = Boolean(jobType || workMode || freshness);
  const partnerVisibleCount = hasAdvancedFilters ? partnerJobs.length : Math.max(partnerJobs.length, partner.totalCount);
  const partnerHasNextPage = !hasAdvancedFilters && (partner.hasNextPage ?? partner.totalCount > page * 20);
  const visibleCount = directJobs.length + partnerVisibleCount;
  const countLabel = visibleCount.toLocaleString("en-IN");
  const savedSearches = viewer.savedSearches.map((item) => ({
    id: item.id,
    name: item.name,
    href: savedSearchHref(item),
    isAlertEnabled: item.is_alert_enabled,
  }));
  const liveTrendJobs = [
    ...directJobs.map(({job}) => ({ title: job.job_title, location: job.location || "India", sector: sectorForText(`${job.job_title} ${job.department ?? ""} ${job.primary_skills ?? ""}`) })),
    ...partnerJobs.map(({job}) => ({ title: job.title, location: job.displayLocation || job.location || "India", sector: sectorForText(`${job.title} ${job.type} ${job.snippet}`) })),
  ];
  const trendRoles = topCounts(liveTrendJobs.map((item) => item.title), 4);
  const trendLocations = topCounts(liveTrendJobs.map((item) => item.location.replace(/ ·.*$/, "")), 4);
  const trendSectors = topCounts(liveTrendJobs.map((item) => item.sector), 4);

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="mx-auto max-w-[1450px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={viewer.isCandidate ? "/candidates/dashboard" : "/"} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16} />{viewer.isCandidate ? "Candidate dashboard" : "Main site"}</Link>
          {viewer.isCandidate && <Link href="/candidates/applications" className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-semibold text-white">Career Activity</Link>}
        </div>

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
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_230px_240px_190px_auto]">
            <label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} /><span className="sr-only">Search roles</span><input name="q" defaultValue={query} placeholder={searchIn === "company" ? "Search company" : "Role or skill"} className="h-13 w-full rounded-xl border border-zinc-200 pl-12 pr-4 outline-none focus:border-zinc-500" /></label>
            <label className="relative"><Layers3 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} /><span className="sr-only">Job sector</span><select name="sector" defaultValue={sector} className="h-13 w-full cursor-pointer appearance-none rounded-xl border border-zinc-200 bg-white pl-12 pr-4 outline-none focus:border-zinc-500"><option value="">All sectors</option>{JOB_SECTORS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
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
            <Link href="/jobs" className="ml-auto inline-flex min-h-9 items-center justify-center rounded-full border border-zinc-300 bg-white px-4 text-xs font-bold text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white">Clear filters</Link>
          </div>

          <div className="mt-4 border-t border-zinc-100 px-1 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-[.14em] text-zinc-400">Explore sectors</span>
              {JOB_SECTORS.map((item) => <Link prefetch={false} key={item.value} href={sectorHref(filters, item.value)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${sector === item.value ? "border-violet-700 bg-violet-700 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"}`}>{item.label}</Link>)}
            </div>
          </div>
        </form>

        {viewer.isCandidate && (
          <SaveSearchControl
            filters={{ query, location, sector, source, jobType, workMode, freshness, searchIn, radius: filters.radius ?? "" }}
            searches={savedSearches}
          />
        )}

        {viewer.isCandidate && viewer.profile && <section className="mt-6 grid gap-4 rounded-[2rem] border border-violet-200 bg-violet-50 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-600">Personalized opportunity feed</p><h2 className="mt-2 text-2xl font-bold">Best profile matches appear first.</h2><p className="mt-2 text-sm leading-6 text-violet-800">Scores use your preferred roles, skills, locations and work mode. They are guidance—not a hiring decision.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/candidates/profile" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-900">Improve matching profile</Link><Link href="/candidates/job-alerts" className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white"><BellRing size={16}/>Manage alerts</Link></div>
        </section>}

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><BadgeCheck className="mt-0.5 shrink-0" /><div><h2 className="font-bold">JobiVerse Direct</h2><p className="mt-1 text-sm leading-6">Published by an employer inside JobiVerse. Sign in to view, save and apply through the protected JobiVerse workflow.</p></div></div>
          <div className="flex items-start gap-4 rounded-3xl border border-violet-200 bg-violet-50 p-5 text-violet-950"><Globe2 className="mt-0.5 shrink-0" /><div><h2 className="font-bold">Partner Opportunity</h2><p className="mt-1 text-sm leading-6">Supplied by a connected public or licensed API source. Application happens on the original destination; JobiVerse does not charge a placement fee for it.</p></div></div>
        </section>

        {source !== "partner" && directJobs.length > 0 && (
          <section className="mt-12">
            <SectionHeading eyebrow="Direct employer roles" title="Apply through JobiVerse" count={directJobs.length} />
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {directJobs.map(({job,match}) => {
                const company = job.companies?.[0] ?? ownerCompanyMap.get(job.employer_id);
                const trust = calculateOpportunityTrust({ title: job.job_title, company: company?.company_name, location: job.location || company?.location, description: job.job_description, skills: job.primary_skills, salary: job.budget_ctc, workMode: job.work_mode, employmentType: job.employment_type, experience: job.experience, postedAt: job.published_at, direct: true, verifiedCompany: company?.is_verified, applyUrl: `https://www.jobiverse.in/jobs/${job.id}` });
                const salary = estimateSalaryRange({ title: job.job_title, location: job.location || company?.location, description: job.job_description, skills: job.primary_skills, salary: job.budget_ctc, experience: job.experience, direct: true });
                return <article key={job.id} className="flex flex-col rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><BriefcaseBusiness size={20} /></span><div className="flex flex-col items-end gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase text-emerald-700">JobiVerse Direct</span><FreshnessBadge value={job.published_at}/></div></div>
                  <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-zinc-600"><Building2 size={15} />{company?.company_name || "JobiVerse hiring partner"}{company?.is_verified && <BadgeCheck size={15} className="text-emerald-600" />}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">{job.job_title}</h2>
                  {match && <div className="mt-3"><JobMatchBadge score={match.score} recommended={match.recommended} compact/></div>}
                  <div className="mt-3 flex flex-wrap items-center gap-2"><TrustBadge score={trust.score} label={trust.label}/><JobCompareButton job={{key:`direct:${job.id}`,title:job.job_title,company:company?.company_name||"JobiVerse hiring partner",location:job.location||company?.location||"India",workMode:job.work_mode||"Flexible",employmentType:job.employment_type||"Not specified",salary:job.budget_ctc||"Not disclosed",estimatedMin:salary.min,estimatedMax:salary.max,trustScore:trust.score,trustLabel:trust.label,source:"JobiVerse Direct",href:`/jobs/${job.id}`,external:false}}/></div>
                  <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500"><MapPin size={15} />{job.location || company?.location || "India"}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2 text-xs"><Essential label="Experience" value={job.experience || "Open"} /><Essential label="Work mode" value={job.work_mode || "Flexible"} /><Essential label={job.budget_ctc ? "Employer budget" : "JobiVerse estimate"} value={job.budget_ctc || salaryEstimateLabel(salary)} /></div>
                  <p className="mt-5 line-clamp-2 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">{job.primary_skills || "Open the role to review its complete requirements."}</p>
                  <Link href={`/jobs/${job.id}`} className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-5 text-sm font-semibold">View complete role <ArrowRight size={16} /></Link>
                </article>;
              })}
            </div>
          </section>
        )}

        {source !== "jobiverse" && (
          <section className="mt-14">
            <SectionHeading eyebrow="Connected discovery feeds" title="Partner opportunities" count={partnerVisibleCount} />
            {partner.nationalFeed && <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">Showing {partnerJobs.length.toLocaleString("en-IN")} listings on this page from {partner.totalCount.toLocaleString("en-IN")} provider-reported opportunities. Locations come from each source or the city-matched discovery feed; always confirm the exact workplace on the original listing.</p>}
            {!partner.configured ? (
              <div className="mt-6 rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center"><Globe2 className="mx-auto text-zinc-400" /><h3 className="mt-4 text-2xl font-semibold">Partner network is being connected</h3><p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-500">JobiVerse will show licensed, attributed opportunities here after the provider connection is activated.</p></div>
            ) : partner.error ? (
              <div className="mt-6 rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-amber-950"><h3 className="font-bold">Partner feed needs attention</h3><p className="mt-2 text-sm">{partner.error} JobiVerse direct roles remain available above.</p></div>
            ) : partnerJobs.length ? (
              <>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {partnerJobs.map(({job,match}) => {const displayLocation=job.displayLocation || partnerLocationLabel(job.location, location, Boolean(partner.locationMatchedByText), `${job.title} ${plainTextSnippet(job.snippet)}`);const trust=calculateOpportunityTrust({title:job.title,company:job.company,location:displayLocation,description:plainTextSnippet(job.snippet),salary:job.salary,employmentType:job.type,postedAt:job.updated,applyUrl:job.link,provider:job.provider||job.source,direct:false});const salary=estimateSalaryRange({title:job.title,location:displayLocation,description:plainTextSnippet(job.snippet),salary:job.salary,employmentType:job.type,direct:false});const trackHref=`/jobs/track?${new URLSearchParams({id:job.id,provider:job.provider||job.source||"Partner",title:job.title,company:job.company,location:displayLocation,url:job.link}).toString()}`;return <article key={`${job.provider ?? "partner"}-${job.id}`} className="flex flex-col rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-950 text-white"><Globe2 size={20} /></span><div className="flex flex-col items-end gap-2"><span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase text-violet-700">Partner Job</span><FreshnessBadge value={job.updated}/></div></div>
                    <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-zinc-600"><Building2 size={15} />{job.company}</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{job.title}</h2>
                    {match && <div className="mt-3"><JobMatchBadge score={match.score} recommended={match.recommended} compact/></div>}
                    <div className="mt-3 flex flex-wrap items-center gap-2"><TrustBadge score={trust.score} label={trust.label}/><JobCompareButton job={{key:`${job.provider||"partner"}:${job.id}`,title:job.title,company:job.company,location:displayLocation,workMode:job.type||"Not specified",employmentType:job.type||"Not specified",salary:job.salary||"Not disclosed",estimatedMin:salary.min,estimatedMax:salary.max,trustScore:trust.score,trustLabel:trust.label,source:job.provider||job.source||"Partner",href:job.link,external:true}}/></div>
                    <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500"><MapPin size={15} />{displayLocation}</p>
                    <div className="mt-5 grid grid-cols-2 gap-2 text-xs"><Essential label="Type" value={job.type || "Not specified"} /><Essential label={job.salary ? "Listed salary" : "JobiVerse estimate"} value={job.salary || salaryEstimateLabel(salary)} />{job.salary && <Essential label="JobiVerse estimate" value={salaryEstimateLabel(salary)} />}</div>
                    <p className="mt-5 line-clamp-3 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">{plainTextSnippet(job.snippet) || "Open the original listing to review complete role details."}</p>
                    <p className="mt-4 text-xs text-zinc-400">Source: {job.provider || job.source || "Partner feed"}{job.updated ? ` · Updated ${formatDate(job.updated)}` : ""}</p>
                    <div className="mt-auto grid grid-cols-2 gap-2 border-t border-zinc-100 pt-5"><a href={job.link} target="_blank" rel="nofollow sponsored noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-3 py-3 text-xs font-semibold text-white">Original listing <ExternalLink size={14} /></a><Link href={trackHref} className="flex items-center justify-center rounded-xl border border-violet-200 px-3 py-3 text-center text-xs font-semibold text-violet-800">Track application</Link></div>
                  </article>})}
                </div>
                <div className="mt-8 flex justify-end gap-2 rounded-2xl border border-zinc-200 bg-white p-4">
                  {page > 1 && <Link href={pageHref(filters, page - 1)} className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold">Previous</Link>}{partnerHasNextPage && <Link href={pageHref(filters, page + 1)} className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">Next page</Link>}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center"><Search className="mx-auto text-zinc-400" /><h3 className="mt-4 text-2xl font-semibold">No partner jobs matched this search</h3><p className="mt-2 text-zinc-500">Try a broader role keyword or use India as the location.</p></div>
            )}
          </section>
        )}

        {!!liveTrendJobs.length && <section className="mt-14 rounded-[2.5rem] border border-zinc-200 bg-white p-8 sm:p-10">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-orange-700"><Flame size={20}/></span><div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Current live feed</p><h2 className="text-3xl font-bold">Trending opportunities.</h2></div></div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">Calculated from the opportunities currently returned by JobiVerse and connected partners—no fabricated trend counts.</p>
          <div className="mt-7 grid gap-5 md:grid-cols-3"><TrendGroup title="Roles" items={trendRoles}/><TrendGroup title="Locations" items={trendLocations}/><TrendGroup title="Sectors" items={trendSectors}/></div>
        </section>}

        <section className="mt-14 grid gap-5 rounded-[2.5rem] bg-zinc-950 p-8 text-white lg:grid-cols-[1fr_auto] lg:items-center sm:p-10">
          <div className="flex items-start gap-4"><ShieldCheck className="mt-1 shrink-0 text-emerald-300" /><div><h2 className="text-2xl font-semibold">Safe opportunity discovery</h2><p className="mt-2 max-w-4xl text-sm leading-7 text-zinc-400">Never pay anyone to apply or interview. Verify the employer and destination before sharing personal data. Partner listings belong to their original publishers and may change or expire outside JobiVerse.</p></div></div>
          <Link href="/signup?role=candidate" className="inline-flex min-h-13 items-center justify-center rounded-xl bg-white px-6 font-semibold text-zinc-950">Build your free JobiVerse profile</Link>
        </section>
      </div>
      <JobCompareTray />
    </main>
  );
}

function TrustBadge({score,label}:{score:number;label:string}){const tone=score>=80?"bg-emerald-50 text-emerald-700":score>=60?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700";return <span title="Opportunity Trust Score uses listing completeness, freshness, attribution and JobiVerse verification signals." className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold ${tone}`}><ShieldCheck size={13}/>{score} · {label}</span>}

function salaryEstimateLabel(salary:{min:number;max:number;unit:string}){return `₹${salary.min}–₹${salary.max} ${salary.unit}`;}

async function getJobsViewer() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isCandidate: false, profile: null, savedSearches: [] as SavedSearchRow[] };

  const { data: profile } = await supabase
    .from("users")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  const isCandidate = profile?.role === "candidate" && profile.is_active !== false;
  if (!isCandidate) return { isCandidate: false, profile: null, savedSearches: [] as SavedSearchRow[] };
  const [{data:candidateProfile},{data:savedSearches,error:savedSearchError}] = await Promise.all([
    supabase.from("candidate_profiles").select("primary_skills,preferred_roles,preferred_locations,work_mode,employment_type,total_experience,resume_path,interview_availability").eq("user_id",user.id).maybeSingle(),
    supabase.from("candidate_saved_searches").select("id,name,query,location,sector,source,job_type,work_mode,freshness,search_in,radius,is_alert_enabled").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(6),
  ]);
  return { isCandidate: true, profile: candidateProfile, savedSearches: savedSearchError ? [] as SavedSearchRow[] : (savedSearches ?? []) as SavedSearchRow[] };
}

type SavedSearchRow = {id:string;name:string;query:string|null;location:string|null;sector:string|null;source:string;job_type:string|null;work_mode:string|null;freshness:string|null;search_in:string|null;radius:string|null;is_alert_enabled:boolean};

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

function partnerLocationLabel(jobLocation: string, searchedLocation: string, matchedByText: boolean, listingText: string) {
  const providerLocation = jobLocation.trim();
  const normalizedProviderLocation = providerLocation.toLowerCase();
  const normalizedSearchLocation = searchedLocation.trim().toLowerCase();
  const isGenericProviderLocation = !providerLocation || normalizedProviderLocation === "india" || normalizedProviderLocation === "not specified";

  if (normalizedSearchLocation !== "india" && isGenericProviderLocation) {
    return `${searchedLocation} · ${matchedByText ? "matched from listing" : "search location"}`;
  }

  if (isGenericProviderLocation) {
    const searchableListing = ` ${listingText.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;
    const uniqueCities = partnerLocationAliases
      .filter(({ aliases }) => aliases.some((alias) => searchableListing.includes(` ${alias} `)))
      .map(({ label }) => label)
      .filter((label, index, labels) => labels.indexOf(label) === index);
    const detectedCities = uniqueCities
      .filter((label) => label !== "Mumbai" || !uniqueCities.includes("Navi Mumbai"))
      .slice(0, 2);

    if (detectedCities.length) return `${detectedCities.join(" / ")} · matched from listing`;
    if (searchableListing.includes(" remote ") || searchableListing.includes(" work from home ")) return "Remote · matched from listing";
  }

  return providerLocation || "India";
}

async function discoverJoobleJobs({
  keywords,
  location,
  page,
  radius,
  companySearch,
}: {
  keywords: string;
  location: string;
  page: number;
  radius?: "0" | "4" | "8" | "16" | "26" | "40" | "80";
  companySearch: boolean;
}): Promise<PartnerJobSearch> {
  if (location.toLowerCase() !== "india") {
    return searchJoobleJobs({ keywords, location, page, resultsPerPage: 20, radius, companySearch });
  }

  const cityPool = popularCities.slice(0, 8);
  const batchSize = 4;
  const batchCount = Math.ceil(cityPool.length / batchSize);
  const batchIndex = (page - 1) % batchCount;
  const providerPage = Math.floor((page - 1) / batchCount) + 1;
  const cities = cityPool.slice(batchIndex * batchSize, (batchIndex + 1) * batchSize);
  const [totalResult, pageResult, cityResults] = await Promise.all([
    searchJoobleJobs({ keywords, location: "India", page: 1, resultsPerPage: 1, companySearch }),
    searchJoobleJobs({ keywords, location: "India", page, resultsPerPage: 20, companySearch }),
    Promise.all(cities.map(async (city) => ({
      city,
      result: await searchJoobleJobs({
        keywords: [keywords, city].filter(Boolean).join(" "),
        location: "India",
        page: providerPage,
        resultsPerPage: 5,
        companySearch,
      }),
    }))),
  ]);

  const seenJobs = new Set<string>();
  const cityJobs = cityResults.flatMap(({ city, result }) => result.jobs
    .filter((job) => {
      if (seenJobs.has(job.id)) return false;
      seenJobs.add(job.id);
      return true;
    })
    .map((job) => ({ ...job, displayLocation: `${city} · partner city match` })));
  const fallbackJobs = pageResult.jobs
    .filter((job) => {
      if (seenJobs.has(job.id)) return false;
      seenJobs.add(job.id);
      return true;
    })
    .map((job) => ({
      ...job,
      displayLocation: partnerLocationLabel(
        job.location,
        "India",
        false,
        `${job.title} ${plainTextSnippet(job.snippet)}`,
      ),
    }));

  return {
    ...pageResult,
    configured: totalResult.configured || pageResult.configured || cityResults.some(({ result }) => result.configured),
    totalCount: totalResult.totalCount || pageResult.totalCount,
    jobs: [...cityJobs, ...fallbackJobs].slice(0, 20),
    nationalFeed: true,
    hasNextPage: (totalResult.totalCount || pageResult.totalCount) > page * 20,
  };
}

const providerLinks: Record<NonNullable<PartnerJob["provider"]>, string> = {
  Jooble: "https://jooble.org",
  Adzuna: "https://www.adzuna.in",
  Remotive: "https://remotive.com",
  Arbeitnow: "https://www.arbeitnow.com",
  Jobicy: "https://jobicy.com",
  Himalayas: "https://himalayas.app",
  "The Muse": "https://www.themuse.com",
};

async function discoverPartnerJobs({
  keywords,
  location,
  page,
  radius,
  companySearch,
}: {
  keywords: string;
  location: string;
  page: number;
  radius?: "0" | "4" | "8" | "16" | "26" | "40" | "80";
  companySearch: boolean;
}): Promise<PartnerJobSearch> {
  const sourceNames = ["Jooble", "Adzuna", "Remotive", "Arbeitnow", "Jobicy", "Himalayas", "The Muse"] as const;
  const results = await Promise.all([
    withPartnerDeadline(discoverJoobleJobs({ keywords, location, page, radius, companySearch })),
    withPartnerDeadline(searchAdzunaJobs({ keywords, location, page, resultsPerPage: 20, companySearch })),
    withPartnerDeadline(searchRemotiveJobs({ keywords, location, page, resultsPerPage: 20, companySearch })),
    withPartnerDeadline(searchArbeitnowJobs({ keywords, location, page, resultsPerPage: 20, companySearch })),
    withPartnerDeadline(searchJobicyJobs({ keywords, location, page, resultsPerPage: 20, companySearch })),
    withPartnerDeadline(searchHimalayasJobs({ keywords, location, page, resultsPerPage: 20, companySearch })),
    withPartnerDeadline(searchMuseJobs({ keywords, location, page, resultsPerPage: 20, companySearch })),
  ]);
  const configuredResults = results.filter((result) => result.configured);
  const jobs = interleavePartnerJobs(results, 20);
  const providers = sourceNames
    .map((name, index) => ({
      name,
      configured: results[index].configured,
      totalCount: results[index].totalCount,
      href: providerLinks[name],
      error: results[index].error,
    }))
    .filter((provider) => provider.configured);
  const allConfiguredSourcesFailed = configuredResults.length > 0
    && configuredResults.every((result) => Boolean(result.error));

  return {
    configured: configuredResults.length > 0,
    totalCount: configuredResults.reduce((sum, result) => sum + result.totalCount, 0),
    jobs,
    nationalFeed: location.toLowerCase() === "india",
    hasNextPage: configuredResults.some((result) => result.hasNextPage ?? result.totalCount > page * 20),
    providers,
    error: jobs.length === 0 && allConfiguredSourcesFailed
      ? "Connected job feeds are temporarily unavailable."
      : undefined,
  };
}

async function withPartnerDeadline(request: Promise<PartnerJobSearch>) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<PartnerJobSearch>((resolve) => {
    timeout = setTimeout(() => resolve({ configured: false, totalCount: 0, jobs: [] }), 4_500);
  });

  try {
    return await Promise.race([request, deadline]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function interleavePartnerJobs(results: PartnerJobSearch[], limit: number) {
  const queues = results.map((result) => [...result.jobs]);
  const seen = new Set<string>();
  const jobs: PartnerJob[] = [];

  while (jobs.length < limit && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const job = queue.shift();
      if (!job) continue;
      const key = `${job.title}|${job.company}|${job.location}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      jobs.push(job);
      if (jobs.length >= limit) break;
    }
  }

  return jobs;
}

function pageHref(filters: Awaited<SearchParams>, page: number) {
  const params = new URLSearchParams();
  for (const key of ["q", "location", "source", "radius", "searchIn", "jobType", "workMode", "freshness", "sector"] as const) {
    if (filters[key]) params.set(key, filters[key]!);
  }
  params.set("page", String(page));
  return `/jobs?${params.toString()}`;
}

function locationHref(filters: Awaited<SearchParams>, city: string) {
  const params = new URLSearchParams();
  for (const key of ["q", "source", "searchIn", "jobType", "workMode", "freshness", "sector"] as const) {
    if (filters[key]) params.set(key, filters[key]!);
  }
  params.set("location", city);
  params.set("radius", "40");
  return `/jobs?${params.toString()}`;
}

function sectorHref(filters: Awaited<SearchParams>, sector: string) {
  const params = new URLSearchParams();
  for (const key of ["q", "location", "source", "radius", "searchIn", "jobType", "workMode", "freshness"] as const) {
    if (filters[key]) params.set(key, filters[key]!);
  }
  params.set("sector", sector);
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

function FreshnessBadge({value}:{value?:string|null}) {
  const freshness=freshnessLabel(value);
  const tone=freshness.tone==="emerald"?"bg-emerald-50 text-emerald-700":freshness.tone==="violet"?"bg-violet-50 text-violet-700":"bg-zinc-100 text-zinc-600";
  return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${tone}`}>{freshness.label}</span>;
}

function TrendGroup({title,items}:{title:string;items:Array<[string,number]>}) {
  return <article className="rounded-3xl bg-zinc-50 p-5"><p className="text-xs font-bold uppercase tracking-[.15em] text-zinc-400">{title}</p><div className="mt-4 space-y-2">{items.map(([label,count],index)=><div key={`${title}-${label}`} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm"><span className="font-semibold"><span className="mr-2 text-zinc-300">{index+1}</span>{label}</span><span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold">{count}</span></div>)}</div></article>;
}

function topCounts(values:string[],limit:number):Array<[string,number]> {
  const counts=new Map<string,number>();
  for(const value of values){const label=value.trim();if(label)counts.set(label,(counts.get(label)??0)+1)}
  return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit);
}

function sectorForText(value:string) {
  return JOB_SECTORS.find((item)=>matchesJobSector(value,item.value))?.label??"Other opportunities";
}

function savedSearchHref(search:SavedSearchRow) {
  const params=new URLSearchParams();
  const values:Record<string,string|null|undefined>={q:search.query,location:search.location,sector:search.sector,source:search.source,jobType:search.job_type,workMode:search.work_mode,freshness:search.freshness,searchIn:search.search_in,radius:search.radius};
  for(const[key,value]of Object.entries(values))if(value)params.set(key,value);
  return `/jobs?${params.toString()}`;
}

import "server-only";

import { z } from "zod";

import { plainTextSnippet, type PartnerJob, type PartnerJobSearch } from "@/lib/jobs/jooble";

type SearchInput = {
  keywords?: string;
  location?: string;
  page?: number;
  resultsPerPage?: number;
  companySearch?: boolean;
};

const INDIA_ELIGIBLE_LOCATIONS = ["india", "worldwide", "anywhere", "global", "asia", "apac", "remote"];

function indiaEligible(value: string) {
  const normalized = value.trim().toLowerCase();
  return INDIA_ELIGIBLE_LOCATIONS.some((token) => normalized.includes(token));
}

function matchesText(job: PartnerJob, keywords: string, companySearch = false) {
  if (!keywords.trim()) return true;
  const searchable = companySearch ? job.company : `${job.title} ${job.snippet}`;
  return searchable.toLowerCase().includes(keywords.trim().toLowerCase());
}

function matchesLocation(value: string, requested: string) {
  const normalizedRequest = requested.trim().toLowerCase();
  if (!normalizedRequest || normalizedRequest === "india") return indiaEligible(value);
  return value.toLowerCase().includes(normalizedRequest);
}

function money(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
    : "";
}

function sourceMoney(value?: number | null, currency = "") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const amount = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
  return currency ? `${currency.toUpperCase()} ${amount}` : amount;
}

const adzunaSchema = z.object({
  count: z.coerce.number().int().nonnegative().default(0),
  results: z.array(z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string().min(1),
    description: z.string().optional().default(""),
    redirect_url: z.string().url(),
    created: z.string().optional().default(""),
    location: z.object({ display_name: z.string().optional().default("India") }).optional(),
    company: z.object({ display_name: z.string().optional().default("Company not disclosed") }).optional(),
    category: z.object({ label: z.string().optional().default("") }).optional(),
    contract_time: z.string().nullable().optional(),
    contract_type: z.string().nullable().optional(),
    salary_min: z.coerce.number().nullable().optional(),
    salary_max: z.coerce.number().nullable().optional(),
  })).default([]),
});

export async function searchAdzunaJobs({
  keywords = "",
  location = "India",
  page = 1,
  resultsPerPage = 20,
  companySearch = false,
}: SearchInput): Promise<PartnerJobSearch> {
  const appId = process.env.ADZUNA_APP_ID?.trim();
  const appKey = process.env.ADZUNA_APP_KEY?.trim();
  if (!appId || !appKey) return { configured: false, totalCount: 0, jobs: [] };

  try {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: String(Math.min(50, Math.max(1, resultsPerPage))),
      "content-type": "application/json",
      sort_by: "date",
      ...(keywords.trim() ? { [companySearch ? "company" : "what"]: keywords.trim() } : {}),
      ...(location.trim() && location.trim().toLowerCase() !== "india" ? { where: location.trim() } : {}),
    });
    const response = await fetch(`https://api.adzuna.com/v1/api/jobs/in/search/${Math.max(1, page)}?${params}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 1800, tags: ["partner-jobs", "adzuna-jobs"] },
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) {
      const error = response.status === 401 || response.status === 403
        ? "Adzuna rejected the Application ID or Application Key."
        : response.status === 429
          ? "Adzuna API quota has been reached."
          : `Adzuna API is temporarily unavailable (HTTP ${response.status}).`;
      return { configured: true, totalCount: 0, jobs: [], error };
    }
    const parsed = adzunaSchema.safeParse(await response.json());
    if (!parsed.success) return { configured: true, totalCount: 0, jobs: [], error: "Adzuna returned an invalid response." };

    const jobs = parsed.data.results.map((job): PartnerJob => {
      const salary = job.salary_min || job.salary_max
        ? [money(job.salary_min), money(job.salary_max)].filter(Boolean).join(" - ")
        : "";
      return {
        id: `adzuna-${job.id}`,
        title: plainTextSnippet(job.title),
        location: job.location?.display_name || "India",
        snippet: plainTextSnippet(job.description),
        salary,
        source: "Adzuna",
        provider: "Adzuna",
        type: [job.contract_time, job.contract_type, job.category?.label].filter(Boolean).join(" · "),
        link: job.redirect_url,
        company: job.company?.display_name || "Company not disclosed",
        updated: job.created,
      };
    });
    return {
      configured: true,
      totalCount: parsed.data.count,
      jobs,
      hasNextPage: parsed.data.count > Math.max(1, page) * Math.max(1, resultsPerPage),
    };
  } catch {
    return { configured: true, totalCount: 0, jobs: [], error: "Adzuna opportunities are temporarily unavailable." };
  }
}

const remotiveSchema = z.object({
  jobs: z.array(z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    url: z.string().url(),
    title: z.string().min(1),
    company_name: z.string().optional().default("Company not disclosed"),
    category: z.string().optional().default(""),
    job_type: z.string().optional().default(""),
    publication_date: z.string().optional().default(""),
    candidate_required_location: z.string().optional().default("Worldwide"),
    salary: z.string().optional().default(""),
    description: z.string().optional().default(""),
  })).default([]),
});

export async function searchRemotiveJobs({
  keywords = "",
  location = "India",
  page = 1,
  resultsPerPage = 20,
  companySearch = false,
}: SearchInput): Promise<PartnerJobSearch> {
  try {
    const params = new URLSearchParams({ limit: "50" });
    if (keywords.trim() && !companySearch) params.set("search", keywords.trim());
    if (keywords.trim() && companySearch) params.set("company_name", keywords.trim());
    const response = await fetch(`https://remotive.com/api/remote-jobs?${params}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 21_600, tags: ["partner-jobs", "remotive-jobs"] },
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) return { configured: true, totalCount: 0, jobs: [], error: "Remotive opportunities are temporarily unavailable." };
    const parsed = remotiveSchema.safeParse(await response.json());
    if (!parsed.success) return { configured: true, totalCount: 0, jobs: [], error: "Remotive returned an invalid response." };
    const eligible = parsed.data.jobs.map((job): PartnerJob => ({
      id: `remotive-${job.id}`,
      title: plainTextSnippet(job.title),
      location: job.candidate_required_location,
      snippet: plainTextSnippet(job.description),
      salary: job.salary,
      source: "Remotive",
      provider: "Remotive",
      type: [job.job_type, job.category].filter(Boolean).join(" · "),
      link: job.url,
      company: job.company_name,
      updated: job.publication_date,
    })).filter((job) => matchesText(job, keywords, companySearch) && matchesLocation(job.location, location));
    const perPage = Math.max(1, resultsPerPage);
    const start = (Math.max(1, page) - 1) * perPage;
    return {
      configured: true,
      totalCount: eligible.length,
      jobs: eligible.slice(start, start + perPage),
      hasNextPage: eligible.length > start + perPage,
    };
  } catch {
    return { configured: true, totalCount: 0, jobs: [], error: "Remotive opportunities are temporarily unavailable." };
  }
}

const arbeitnowSchema = z.object({
  data: z.array(z.object({
    slug: z.string().min(1),
    company_name: z.string().optional().default("Company not disclosed"),
    title: z.string().min(1),
    description: z.string().optional().default(""),
    remote: z.boolean().optional().default(false),
    url: z.string().url(),
    tags: z.array(z.string()).optional().default([]),
    job_types: z.array(z.string()).optional().default([]),
    location: z.string().optional().default(""),
    created_at: z.union([z.string(), z.number()]).optional(),
  })).default([]),
  meta: z.object({
    current_page: z.coerce.number().optional(),
    last_page: z.coerce.number().optional(),
    total: z.coerce.number().optional(),
  }).optional(),
});

export async function searchArbeitnowJobs({
  keywords = "",
  location = "India",
  page = 1,
  resultsPerPage = 20,
  companySearch = false,
}: SearchInput): Promise<PartnerJobSearch> {
  try {
    const response = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${Math.max(1, page)}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 3600, tags: ["partner-jobs", "arbeitnow-jobs"] },
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) return { configured: true, totalCount: 0, jobs: [], error: "Arbeitnow opportunities are temporarily unavailable." };
    const parsed = arbeitnowSchema.safeParse(await response.json());
    if (!parsed.success) return { configured: true, totalCount: 0, jobs: [], error: "Arbeitnow returned an invalid response." };
    const eligible = parsed.data.data.map((job): PartnerJob => ({
      id: `arbeitnow-${job.slug}`,
      title: plainTextSnippet(job.title),
      location: job.location || (job.remote ? "Remote" : "Location on source"),
      snippet: plainTextSnippet(job.description),
      salary: "",
      source: "Arbeitnow",
      provider: "Arbeitnow",
      type: [...job.job_types, ...job.tags.slice(0, 2)].join(" · "),
      link: job.url,
      company: job.company_name,
      updated: typeof job.created_at === "number"
        ? new Date(job.created_at * 1000).toISOString()
        : job.created_at || "",
    })).filter((job) => matchesText(job, keywords, companySearch) && matchesLocation(job.location, location));
    const perPage = Math.max(1, resultsPerPage);
    return {
      configured: true,
      totalCount: eligible.length,
      jobs: eligible.slice(0, perPage),
      hasNextPage: (parsed.data.meta?.current_page ?? page) < (parsed.data.meta?.last_page ?? page),
    };
  } catch {
    return { configured: true, totalCount: 0, jobs: [], error: "Arbeitnow opportunities are temporarily unavailable." };
  }
}

const jobicySchema = z.object({
  jobs: z.array(z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    url: z.string().url(),
    jobTitle: z.string().min(1),
    companyName: z.string().optional().default("Company not disclosed"),
    jobIndustry: z.array(z.string()).optional().default([]),
    jobType: z.array(z.string()).optional().default([]),
    jobGeo: z.string().optional().default("Anywhere"),
    jobLevel: z.string().optional().default(""),
    jobExcerpt: z.string().optional().default(""),
    jobDescription: z.string().optional().default(""),
    pubDate: z.string().optional().default(""),
    salaryMin: z.coerce.number().nullable().optional(),
    salaryMax: z.coerce.number().nullable().optional(),
    salaryCurrency: z.string().optional().default(""),
    salaryPeriod: z.string().optional().default(""),
  })).default([]),
});

export async function searchJobicyJobs({
  keywords = "",
  location = "India",
  page = 1,
  resultsPerPage = 20,
  companySearch = false,
}: SearchInput): Promise<PartnerJobSearch> {
  try {
    const params = new URLSearchParams({ count: "40" });
    if (keywords.trim().length >= 3 && !companySearch) params.set("tag", keywords.trim().slice(0, 50));
    const response = await fetch(`https://jobicy.com/api/v2/remote-jobs?${params}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 3600, tags: ["partner-jobs", "jobicy-jobs"] },
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) return { configured: true, totalCount: 0, jobs: [], error: "Jobicy opportunities are temporarily unavailable." };
    const parsed = jobicySchema.safeParse(await response.json());
    if (!parsed.success) return { configured: true, totalCount: 0, jobs: [], error: "Jobicy returned an invalid response." };
    const eligible = parsed.data.jobs.map((job): PartnerJob => {
      const salary = job.salaryMin || job.salaryMax
        ? [sourceMoney(job.salaryMin, job.salaryCurrency), sourceMoney(job.salaryMax, job.salaryCurrency)]
            .filter(Boolean)
            .join(" - ") + (job.salaryPeriod ? ` / ${job.salaryPeriod}` : "")
        : "";
      return {
        id: `jobicy-${job.id}`,
        title: plainTextSnippet(job.jobTitle),
        location: job.jobGeo,
        snippet: plainTextSnippet(job.jobExcerpt || job.jobDescription),
        salary,
        source: "Jobicy",
        provider: "Jobicy",
        type: [...job.jobType, job.jobLevel, ...job.jobIndustry.slice(0, 1)].filter(Boolean).join(" · "),
        link: job.url,
        company: job.companyName,
        updated: job.pubDate,
      };
    }).filter((job) => matchesText(job, keywords, companySearch) && matchesLocation(job.location, location));
    const perPage = Math.max(1, resultsPerPage);
    const start = (Math.max(1, page) - 1) * perPage;
    return {
      configured: true,
      totalCount: eligible.length,
      jobs: eligible.slice(start, start + perPage),
      hasNextPage: eligible.length > start + perPage,
    };
  } catch {
    return { configured: true, totalCount: 0, jobs: [], error: "Jobicy opportunities are temporarily unavailable." };
  }
}

const himalayasSchema = z.object({
  totalCount: z.coerce.number().int().nonnegative().default(0),
  jobs: z.array(z.object({
    guid: z.string().min(1),
    title: z.string().min(1),
    excerpt: z.string().optional().default(""),
    description: z.string().optional().default(""),
    companyName: z.string().optional().default("Company not disclosed"),
    employmentType: z.string().optional().default(""),
    seniority: z.array(z.string()).optional().default([]),
    categories: z.array(z.string()).optional().default([]),
    minSalary: z.coerce.number().nullable().optional(),
    maxSalary: z.coerce.number().nullable().optional(),
    salaryPeriod: z.string().optional().default(""),
    currency: z.string().nullable().optional().transform((value) => value ?? ""),
    locationRestrictions: z.array(z.union([
      z.string(),
      z.object({ name: z.string().optional().default("") }),
    ])).optional().default([]),
    pubDate: z.union([z.string(), z.number()]).optional(),
    applicationLink: z.string().url(),
  })).default([]),
});

export async function searchHimalayasJobs({
  keywords = "",
  location = "India",
  page = 1,
  resultsPerPage = 20,
}: SearchInput): Promise<PartnerJobSearch> {
  try {
    const params = new URLSearchParams({
      country: "India",
      sort: "recent",
      page: String(Math.max(1, page)),
    });
    if (keywords.trim()) params.set("q", keywords.trim());
    const response = await fetch(`https://himalayas.app/jobs/api/search?${params}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 86_400, tags: ["partner-jobs", "himalayas-jobs"] },
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) return { configured: true, totalCount: 0, jobs: [], error: "Himalayas opportunities are temporarily unavailable." };
    const parsed = himalayasSchema.safeParse(await response.json());
    if (!parsed.success) return { configured: true, totalCount: 0, jobs: [], error: "Himalayas returned an invalid response." };
    const jobs = parsed.data.jobs.slice(0, resultsPerPage).map((job): PartnerJob => {
      const salary = job.minSalary || job.maxSalary
        ? [sourceMoney(job.minSalary, job.currency), sourceMoney(job.maxSalary, job.currency)]
            .filter(Boolean)
            .join(" - ") + (job.salaryPeriod ? ` / ${job.salaryPeriod}` : "")
        : "";
      const restrictions = job.locationRestrictions
        .map((item) => typeof item === "string" ? item : item.name)
        .filter(Boolean);
      return {
        id: `himalayas-${job.guid}`,
        title: plainTextSnippet(job.title),
        location: restrictions.length ? `${restrictions.join(" / ")} · Remote` : "Worldwide · Remote",
        snippet: plainTextSnippet(job.excerpt || job.description),
        salary,
        source: "Himalayas",
        provider: "Himalayas",
        type: [job.employmentType, ...job.seniority.slice(0, 1), ...job.categories.slice(0, 1)].filter(Boolean).join(" · "),
        link: job.applicationLink,
        company: job.companyName,
        updated: typeof job.pubDate === "number" ? new Date(job.pubDate).toISOString() : job.pubDate || "",
      };
    });
    return {
      configured: true,
      totalCount: parsed.data.totalCount,
      jobs,
      hasNextPage: parsed.data.totalCount > Math.max(1, page) * Math.max(1, resultsPerPage),
    };
  } catch {
    return { configured: true, totalCount: 0, jobs: [], error: "Himalayas opportunities are temporarily unavailable." };
  }
}

const museSchema = z.object({
  page_count: z.coerce.number().int().nonnegative().default(0),
  page: z.coerce.number().int().nonnegative().default(0),
  results: z.array(z.object({
    id: z.union([z.string(), z.number()]).transform(String),
    name: z.string().min(1),
    publication_date: z.string().optional().default(""),
    contents: z.string().optional().default(""),
    refs: z.object({ landing_page: z.string().url() }),
    company: z.object({ name: z.string().optional().default("Company not disclosed") }),
    locations: z.array(z.object({ name: z.string() })).optional().default([]),
    levels: z.array(z.object({ name: z.string() })).optional().default([]),
    categories: z.array(z.object({ name: z.string() })).optional().default([]),
  })).default([]),
});

export async function searchMuseJobs({
  keywords = "",
  location = "India",
  page = 1,
  resultsPerPage = 20,
  companySearch = false,
}: SearchInput): Promise<PartnerJobSearch> {
  const apiKey = process.env.THE_MUSE_API_KEY?.trim();
  if (!apiKey) return { configured: false, totalCount: 0, jobs: [] };
  try {
    const params = new URLSearchParams({ page: String(Math.max(0, page - 1)), api_key: apiKey });
    if (companySearch && keywords.trim()) params.append("company", keywords.trim());
    if (location.trim().toLowerCase() !== "india") params.append("location", location.trim());
    const response = await fetch(`https://www.themuse.com/api/public/jobs?${params}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 3600, tags: ["partner-jobs", "muse-jobs"] },
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) return { configured: true, totalCount: 0, jobs: [], error: "The Muse opportunities are temporarily unavailable." };
    const parsed = museSchema.safeParse(await response.json());
    if (!parsed.success) return { configured: true, totalCount: 0, jobs: [], error: "The Muse returned an invalid response." };
    const eligible = parsed.data.results.map((job): PartnerJob => ({
      id: `muse-${job.id}`,
      title: plainTextSnippet(job.name),
      location: job.locations.map((item) => item.name).join(" / ") || "Flexible / Remote",
      snippet: plainTextSnippet(job.contents),
      salary: "",
      source: "The Muse",
      provider: "The Muse",
      type: [...job.levels.map((item) => item.name), ...job.categories.slice(0, 1).map((item) => item.name)].join(" · "),
      link: job.refs.landing_page,
      company: job.company.name,
      updated: job.publication_date,
    })).filter((job) => matchesText(job, keywords, companySearch) && matchesLocation(job.location, location)).slice(0, resultsPerPage);
    return {
      configured: true,
      totalCount: eligible.length,
      jobs: eligible,
      hasNextPage: parsed.data.page + 1 < parsed.data.page_count,
    };
  } catch {
    return { configured: true, totalCount: 0, jobs: [], error: "The Muse opportunities are temporarily unavailable." };
  }
}

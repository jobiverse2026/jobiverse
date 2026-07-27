import "server-only";

import { z } from "zod";

const joobleJobSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().min(1),
  location: z.string().optional().default("India"),
  snippet: z.string().optional().default(""),
  salary: z.string().optional().default(""),
  source: z.string().optional().default("Jooble"),
  type: z.string().optional().default(""),
  link: z.string().url(),
  company: z.string().optional().default("Company not disclosed"),
  updated: z.string().optional().default(""),
});

const joobleResponseSchema = z.object({
  totalCount: z.coerce.number().int().nonnegative().default(0),
  jobs: z.array(joobleJobSchema).default([]),
});

export type PartnerJob = z.infer<typeof joobleJobSchema>;

export type PartnerJobSearch = {
  configured: boolean;
  totalCount: number;
  jobs: PartnerJob[];
  error?: string;
  locationMatchedByText?: boolean;
};

type SearchInput = {
  keywords?: string;
  location?: string;
  page?: number;
  resultsPerPage?: number;
  radius?: "0" | "4" | "8" | "16" | "26" | "40" | "80";
  companySearch?: boolean;
};

export async function searchJoobleJobs({
  keywords = "",
  location = "India",
  page = 1,
  resultsPerPage = 20,
  radius,
  companySearch = false,
}: SearchInput): Promise<PartnerJobSearch> {
  const apiKey = process.env.JOOBLE_API_KEY?.trim();
  if (!apiKey) return { configured: false, totalCount: 0, jobs: [] };

  try {
    const request = async (body: Record<string, string | number>) => {
      const response = await fetch(`https://jooble.org/api/${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        next: { revalidate: 1800, tags: ["partner-jobs", "jooble-jobs"] },
        signal: AbortSignal.timeout(12_000),
      });

      if (!response.ok) {
        return {
          configured: true,
          totalCount: 0,
          jobs: [],
          error: response.status === 403
            ? "Partner job feed credentials need attention."
            : "Partner opportunities are temporarily unavailable.",
        } satisfies PartnerJobSearch;
      }

      const parsed = joobleResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        return { configured: true, totalCount: 0, jobs: [], error: "Partner job feed returned an invalid response." } satisfies PartnerJobSearch;
      }

      return { configured: true, totalCount: parsed.data.totalCount, jobs: parsed.data.jobs } satisfies PartnerJobSearch;
    };

    const primary = await request({
        keywords: keywords.trim(),
        location: location.trim() || "India",
        page: String(Math.max(1, page)),
        ResultOnPage: Math.min(20, Math.max(1, resultsPerPage)),
        SearchMode: "0",
        companysearch: companySearch ? "true" : "false",
        ...(radius ? { radius } : {}),
    });

    if (!primary.error && primary.totalCount === 0 && location.trim().toLowerCase() !== "india") {
      const fallback = await request({
        keywords: [keywords.trim(), location.trim()].filter(Boolean).join(" "),
        location: "India",
        page: String(Math.max(1, page)),
        ResultOnPage: Math.min(20, Math.max(1, resultsPerPage)),
        SearchMode: "0",
        companysearch: companySearch ? "true" : "false",
      });
      if (!fallback.error && fallback.totalCount > 0) return { ...fallback, locationMatchedByText: true };
    }

    return primary;
  } catch {
    return { configured: true, totalCount: 0, jobs: [], error: "Partner opportunities are temporarily unavailable." };
  }
}

export function plainTextSnippet(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

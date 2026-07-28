import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CandidateJobsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === "string" && value) params.set(key, value);
    if (Array.isArray(value)) value.filter(Boolean).forEach((item) => params.append(key, item));
  }

  const query = params.toString();
  redirect(query ? `/jobs?${query}` : "/jobs");
}

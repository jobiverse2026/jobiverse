"use server";

import { requireRole } from "@/lib/auth/authorization";

export async function getDashboardData() {
  const { supabase } = await requireRole(["admin"]);

  // Live Counts
  const [
    requirements,
    companies,
    candidates,
    recruiters,
  ] = await Promise.all([
    supabase.from("requirements").select("*", {
      count: "exact",
      head: true,
    }),

    supabase.from("companies").select("*", {
      count: "exact",
      head: true,
    }),

    supabase.from("candidates").select("*", {
      count: "exact",
      head: true,
    }),

    supabase.from("users").select("*", {
      count: "exact",
      head: true,
    }).eq("role", "recruiter"),
  ]);

  // Latest Requirements
  const { data: latestRequirements } = await supabase
    .from("requirements")
    .select(`
      id,
      job_title,
      status,
      created_at,
      companies (
        company_name,
        location
      )
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(10);

  return {
    stats: {
      requirements: requirements.count ?? 0,
      companies: companies.count ?? 0,
      candidates: candidates.count ?? 0,
      recruiters: recruiters.count ?? 0,
    },

    latestRequirements: latestRequirements ?? [],
  };
}

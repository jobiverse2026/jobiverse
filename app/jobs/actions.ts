"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const savedSearchSchema = z.object({
  name: z.string().trim().min(2).max(80),
  query: z.string().trim().max(200).optional(),
  location: z.string().trim().max(120).optional(),
  sector: z.string().trim().max(80).optional(),
  source: z.enum(["all", "jobiverse", "partner"]).default("all"),
  jobType: z.string().trim().max(40).optional(),
  workMode: z.string().trim().max(40).optional(),
  freshness: z.string().trim().max(10).optional(),
  searchIn: z.enum(["role", "company"]).default("role"),
  radius: z.string().trim().max(10).optional(),
  alertEnabled: z.boolean().default(false),
});

export type SaveSearchState = { ok: boolean; message: string };

export async function saveCandidateSearch(input: z.input<typeof savedSearchSchema>): Promise<SaveSearchState> {
  const parsed = savedSearchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please give this search a short name." };
  const { supabase, user } = await requireRole(["candidate"]);
  const data = parsed.data;
  const { error } = await supabase.from("candidate_saved_searches").upsert({
    user_id: user.id,
    name: data.name,
    query: data.query || null,
    location: data.location || null,
    sector: data.sector || null,
    source: data.source,
    job_type: data.jobType || null,
    work_mode: data.workMode || null,
    freshness: data.freshness || null,
    search_in: data.searchIn,
    radius: data.radius || null,
    is_alert_enabled: data.alertEnabled,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,name" });
  if (error) return { ok: false, message: error.code === "42P01" ? "Saved searches are being activated. Please run the latest migration." : error.message };
  if (data.alertEnabled) {
    const { data: current } = await supabase.from("candidate_job_alert_preferences").select("*").eq("user_id", user.id).maybeSingle();
    const addTextPreference = (existing: string | null | undefined, next: string | undefined) => {
      const values = String(existing ?? "").split(/[,;/|]+/).map((value) => value.trim()).filter(Boolean);
      if (next && !values.some((value) => value.toLowerCase() === next.toLowerCase())) values.push(next);
      return values.length ? values.join(", ") : null;
    };
    const addArrayPreference = (existing: string[] | null | undefined, next: string | undefined) => {
      const values = [...(existing ?? [])];
      if (next && !values.some((value) => value.toLowerCase() === next.toLowerCase())) values.push(next);
      return values.length ? values : null;
    };
    const { error: alertError } = await supabase.from("candidate_job_alert_preferences").upsert({
      user_id: user.id,
      role_titles: addTextPreference(current?.role_titles, data.searchIn === "role" ? data.query : undefined),
      locations: addTextPreference(current?.locations, data.location),
      sectors: addArrayPreference(current?.sectors, data.sector),
      work_modes: addArrayPreference(current?.work_modes, data.workMode),
      job_types: addArrayPreference(current?.job_types, data.jobType),
      experience_range: current?.experience_range ?? null,
      salary_expectation: current?.salary_expectation ?? null,
      frequency: current?.frequency ?? "instant",
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (alertError) return { ok: false, message: alertError.message };
  }
  revalidatePath("/jobs");
  return { ok: true, message: data.alertEnabled ? "Search saved and matching direct-role alerts enabled." : "Search saved successfully." };
}

export async function deleteCandidateSearch(id: string) {
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return;
  const { supabase, user } = await requireRole(["candidate"]);
  await supabase.from("candidate_saved_searches").delete().eq("id", parsed.data).eq("user_id", user.id);
  revalidatePath("/jobs");
}

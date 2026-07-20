"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const schema = z.object({
  roleTitles: z.string().trim().max(500),
  locations: z.string().trim().max(500),
  workModes: z.array(z.string()).optional(),
  experienceRange: z.string().trim().max(100),
  salaryExpectation: z.string().trim().max(100),
  frequency: z.enum(["instant", "daily", "weekly"]),
  isActive: z.boolean(),
});

export async function saveJobAlerts(formData: FormData) {
  const parsed = schema.parse({
    roleTitles: formData.get("roleTitles") ?? "",
    locations: formData.get("locations") ?? "",
    workModes: formData.getAll("workModes").map(String),
    experienceRange: formData.get("experienceRange") ?? "",
    salaryExpectation: formData.get("salaryExpectation") ?? "",
    frequency: formData.get("frequency") ?? "instant",
    isActive: formData.get("isActive") === "on",
  });
  const { supabase, user } = await requireRole(["candidate"]);
  const { error } = await supabase.from("candidate_job_alert_preferences").upsert({
    user_id: user.id,
    role_titles: parsed.roleTitles || null,
    locations: parsed.locations || null,
    work_modes: parsed.workModes?.length ? parsed.workModes : null,
    experience_range: parsed.experienceRange || null,
    salary_expectation: parsed.salaryExpectation || null,
    frequency: parsed.frequency,
    is_active: parsed.isActive,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/candidates/job-alerts");
  redirect("/candidates/job-alerts?saved=1");
}

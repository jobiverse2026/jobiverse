"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const trackedApplicationSchema = z.object({
  externalJobId: z.string().trim().min(1).max(300),
  provider: z.string().trim().min(1).max(80),
  title: z.string().trim().min(2).max(250),
  company: z.string().trim().max(250).optional(),
  location: z.string().trim().max(250).optional(),
  applyUrl: z.string().trim().url().refine((value) => value.startsWith("https://"), "A secure job URL is required."),
  status: z.enum(["Saved", "Applied", "Response awaited"]),
  notes: z.string().trim().max(1500).optional(),
});

export async function trackPartnerApplication(formData: FormData) {
  const { supabase, user } = await requireRole(["candidate"]);
  const parsed = trackedApplicationSchema.parse({
    externalJobId: formData.get("externalJobId"),
    provider: formData.get("provider"),
    title: formData.get("title"),
    company: formData.get("company") || undefined,
    location: formData.get("location") || undefined,
    applyUrl: formData.get("applyUrl"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });

  const record = {
    candidate_user_id: user.id,
    source_type: "partner",
    provider: parsed.provider,
    external_job_id: parsed.externalJobId,
    job_title: parsed.title,
    company_name: parsed.company || null,
    location: parsed.location || null,
    apply_url: parsed.applyUrl,
    status: parsed.status,
    notes: parsed.notes || null,
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data: existing } = await supabase.from("candidate_tracked_applications").select("id")
    .eq("candidate_user_id", user.id).eq("provider", parsed.provider).eq("external_job_id", parsed.externalJobId).maybeSingle();
  const { error } = existing
    ? await supabase.from("candidate_tracked_applications").update(record).eq("id", existing.id)
    : await supabase.from("candidate_tracked_applications").insert(record);
  if (error) throw new Error(error.message);
  redirect("/candidates/applications?tracked=1");
}

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["Saved", "Applied", "Response awaited", "Interview", "Offer", "Rejected", "Withdrawn", "Joined"]),
});

export async function updateTrackedApplication(formData: FormData) {
  const { supabase, user } = await requireRole(["candidate"]);
  const parsed = updateSchema.parse({ id: formData.get("id"), status: formData.get("status") });
  const { error } = await supabase.from("candidate_tracked_applications")
    .update({ status: parsed.status, updated_at: new Date().toISOString() })
    .eq("id", parsed.id).eq("candidate_user_id", user.id);
  if (error) throw new Error(error.message);
  redirect("/candidates/applications?updated=1");
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export type JobReportState = { error?: string; success?: string };

const schema = z.object({
  requirementId: z.string().uuid(),
  reason: z.enum(["fee_request", "misleading", "expired", "discrimination", "suspicious_contact", "other"]),
  details: z.string().trim().min(10, "Add at least 10 characters explaining the concern.").max(1000),
});

export async function reportJob(_state: JobReportState, formData: FormData): Promise<JobReportState> {
  const parsed = schema.safeParse({ requirementId: formData.get("requirementId"), reason: formData.get("reason"), details: formData.get("details") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the report details." };
  const { supabase, user } = await requireRole(["candidate"]);
  const { data: requirement } = await supabase.from("requirements").select("id,job_title,is_public").eq("id", parsed.data.requirementId).maybeSingle();
  if (!requirement?.is_public) return { error: "This opportunity is no longer publicly available." };
  const { error } = await supabase.from("job_reports").insert({ requirement_id: requirement.id, reporter_id: user.id, reason: parsed.data.reason, details: parsed.data.details });
  if (error) return { error: error.code === "23505" ? "You already reported this opportunity. JobiVerse is reviewing it." : error.message };
  const [{ data: admins }, { data: reporter }] = await Promise.all([
    supabase.from("users").select("id").eq("role", "admin"),
    supabase.from("users").select("full_name,email").eq("id", user.id).maybeSingle(),
  ]);
  if (admins?.length) await adminSupabase.from("notifications").insert(admins.map((admin) => ({ user_id: admin.id, type: "job_report_new", title: "New job safety report", message: `${reporter?.full_name || reporter?.email || "A candidate"} reported ${requirement.job_title} for ${parsed.data.reason.replaceAll("_", " ")}.`, href: "/admin/trust-safety", reference_id: requirement.id })));
  revalidatePath("/admin/trust-safety");
  return { success: "Report received privately. JobiVerse will review this opportunity." };
}

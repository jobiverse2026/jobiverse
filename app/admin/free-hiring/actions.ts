"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export async function updateDirectHireFeeStatus(applicationId: string, status: string) {
  const input = z.object({ applicationId: z.string().uuid(), status: z.enum(["due", "invoiced", "paid", "waived"]) }).parse({ applicationId, status });
  await requireRole(["admin"]);
  const { data: application, error: readError } = await adminSupabase
    .from("candidate_applications")
    .select("id,applicant_name,success_fee_amount,requirements(job_title,employer_id)")
    .eq("id", input.applicationId)
    .maybeSingle();
  if (readError || !application) throw new Error(readError?.message || "Direct hire record not found.");

  const { error } = await adminSupabase.from("candidate_applications").update({ success_fee_status: input.status, updated_at: new Date().toISOString() }).eq("id", input.applicationId);
  if (error) throw new Error(error.message);

  const requirement = Array.isArray((application as any).requirements) ? (application as any).requirements[0] : (application as any).requirements;
  if (requirement?.employer_id) {
    await adminSupabase.from("notifications").insert({
      user_id: requirement.employer_id,
      type: "direct_hire_fee_update",
      title: "Direct-hire success fee updated",
      message: `The 3% success fee for ${application.applicant_name || "your hired applicant"} (${requirement.job_title || "published role"}) is now ${input.status}.`,
      href: `/employers/external-applicants/${application.id}`,
      reference_id: application.id,
    });
  }

  revalidatePath("/admin/free-hiring");
  return { success: `Success fee marked ${input.status}.` };
}

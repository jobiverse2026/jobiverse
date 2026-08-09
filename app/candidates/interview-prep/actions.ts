"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

export async function saveInterviewPrepAnswer(formData: FormData) {
  const { supabase, user } = await requireRole(["candidate"]);
  const applicationIdRaw = String(formData.get("applicationId") ?? "");
  const applicationId = applicationIdRaw ? z.string().uuid().parse(applicationIdRaw) : null;
  const promptKey = z.string().trim().min(2).max(80).parse(formData.get("promptKey"));
  const answer = z.string().trim().min(1).max(5000).parse(formData.get("answer"));
  const { error } = await supabase.from("interview_prep_notes").upsert({ candidate_user_id: user.id, application_id: applicationId, prompt_key: promptKey, answer, updated_at: new Date().toISOString() }, { onConflict: "candidate_user_id,application_id,prompt_key" });
  if (error) throw new Error(error.message);
  revalidatePath("/candidates/interview-prep");
}


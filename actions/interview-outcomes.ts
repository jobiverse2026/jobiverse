"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";

const schema = z.object({
  interviewId: z.string().uuid(),
  candidateId: z.string().uuid(),
  status: z.enum(["completed", "cancelled", "rescheduled", "no_show"]),
  feedback: z.string().trim().max(3000).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  candidateStatus: z.enum(["Interview", "Selected", "Rejected"]).default("Interview"),
  rescheduledDate: z.string().optional(),
});

export async function updateInterviewOutcome(values: unknown) {
  const result = schema.safeParse(values);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Please check the interview outcome.");

  const parsed = result.data;
  const rescheduledDate = parsed.rescheduledDate ? new Date(parsed.rescheduledDate) : null;

  if (parsed.status === "rescheduled" && (!rescheduledDate || Number.isNaN(rescheduledDate.getTime()) || rescheduledDate <= new Date())) {
    throw new Error("Please select a valid future date and time for the rescheduled interview.");
  }

  if (parsed.status !== "completed" && parsed.candidateStatus !== "Interview") {
    throw new Error("Mark the interview completed before selecting or rejecting the candidate.");
  }

  const { supabase } = await requireRole(["recruiter", "admin"]);
  const { error } = await supabase.rpc("update_interview_outcome", {
    p_interview_id: parsed.interviewId,
    p_status: parsed.status,
    p_feedback: parsed.feedback || null,
    p_rating: parsed.rating || null,
    p_candidate_status: parsed.candidateStatus,
    p_rescheduled_date: rescheduledDate?.toISOString() || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/recruiter/candidates/${parsed.candidateId}`);
  revalidatePath("/recruiter/candidates");
  revalidatePath("/recruiter");
  revalidatePath(`/employers/candidates/${parsed.candidateId}`);
  revalidatePath("/employers/dashboard");
}

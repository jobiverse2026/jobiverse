"use server";

import { revalidatePath } from "next/cache";

import { createCandidateActivity } from "@/actions/candidate-activity";
import { requireRole } from "@/lib/auth/authorization";

const ALLOWED_STATUSES = [
  "Submitted",
  "Screening",
  "Client Submitted",
  "Interview",
  "Selected",
  "Rejected",
] as const;

export async function updateCandidateStatus(
  candidateId: string,
  newStatus: string
) {
  // ----------------------------
  // Validate
  // ----------------------------

  if (!candidateId) {
    throw new Error("Candidate ID is required.");
  }

  if (!ALLOWED_STATUSES.some((status) => status === newStatus)) {
    throw new Error("Invalid candidate status.");
  }

  const { supabase, user, profile } = await requireRole(["admin", "recruiter"]);

  // ----------------------------
  // Get Existing Candidate
  // ----------------------------

  const {
    data: candidate,
    error: fetchError,
  } = await supabase
    .from("candidates")
    .select("id, full_name, status, recruiter_id")
    .eq("id", candidateId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!candidate) {
    throw new Error("Candidate not found.");
  }

  if (profile.role === "recruiter" && candidate.recruiter_id !== user.id) {
    throw new Error("You can only update candidates assigned to you.");
  }

  // Already in same stage

  if (candidate.status === newStatus) {
    return {
      success: true,
    };
  }

  // ----------------------------
  // Update Status
  // ----------------------------

  const { error: updateError } = await supabase
    .from("candidates")
    .update({
      status: newStatus,
    })
    .eq("id", candidateId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // ----------------------------
  // Activity Log
  // ----------------------------

  try {
    await createCandidateActivity(
      candidateId,
      "Status Changed",
      `${candidate.full_name} moved from "${candidate.status}" to "${newStatus}".`
    );
  } catch (e) {
    console.error("Activity log failed:", e);
  }

  // ----------------------------
  // Refresh Server Components
  // ----------------------------

  revalidatePath("/recruiter/candidates");
  revalidatePath(`/recruiter/candidates/${candidateId}`);

  return {
    success: true,
    oldStatus: candidate.status,
    newStatus,
  };
}

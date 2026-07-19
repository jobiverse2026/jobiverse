"use server";

import { requireRole } from "@/lib/auth/authorization";

export async function assignRecruiter(
  requirementId: string,
  recruiterId: string
) {
  const { supabase } = await requireRole(["admin"]);

  // Check recruiter exists
  const {
    data: recruiter,
    error: recruiterError,
  } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", recruiterId)
    .eq("role", "recruiter")
    .single();


  if (recruiterError || !recruiter) {
    return {
      success: false,
      error: "Recruiter not found.",
    };
  }


  // Assign recruiter to requirement
  const {
    error,
  } = await supabase
    .from("requirements")
    .update({
  assigned_recruiter: recruiter.id,
  status: "Assigned",
  updated_at: new Date().toISOString(),
})
    .eq("id", requirementId);


  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }


  return {
    success: true,
  };
}

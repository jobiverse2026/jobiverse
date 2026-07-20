"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const employerCandidateStatuses = ["Client Submitted", "Interview", "Selected", "Offered", "Joined", "Rejected", "Withdrawn"] as const;

export async function updateEmployerCandidateStatus(formData: FormData) {
  const candidateId = z.string().uuid().parse(formData.get("candidateId"));
  const status = z.enum(employerCandidateStatuses).parse(formData.get("status"));
  const { user, profile } = await requireRole(["employer"]);

  const { data: candidate, error: candidateError } = await adminSupabase
    .from("candidates")
    .select("id, full_name, status, recruiter_name, recruiter_email, source, requirements!inner(id, job_title, employer_id)")
    .eq("id", candidateId)
    .eq("requirements.employer_id", user.id)
    .maybeSingle();

  if (candidateError) throw new Error(candidateError.message);
  if (!candidate) throw new Error("Candidate not found or access denied.");

  const requirement = Array.isArray(candidate.requirements) ? candidate.requirements[0] : candidate.requirements;
  const previousStatus = String(candidate.status ?? "");

  if (previousStatus !== status) {
    const { error } = await adminSupabase
      .from("candidates")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", candidateId);

    if (error) throw new Error(error.message);

    const isJobiVerseCandidate =
      candidate.source === "jobiverse_hiring_team" ||
      candidate.recruiter_name === "JobiVerse Hiring Team" ||
      candidate.recruiter_email === "jobiverse@outlook.com";

    if (isJobiVerseCandidate) {
      const { data: admins } = await adminSupabase
        .from("users")
        .select("id")
        .eq("role", "admin")
        .eq("is_active", true);

      const actorName = profile.full_name || profile.email || "Employer";
      const rows = (admins ?? []).map((admin) => ({
        user_id: admin.id,
        type: "candidate_status",
        title: "Employer updated JobiVerse candidate",
        message: `${actorName} moved ${candidate.full_name || "a candidate"} for ${requirement?.job_title || "a requirement"} from ${previousStatus || "previous status"} to ${status}.`,
        href: `/admin/candidates?q=${encodeURIComponent(candidate.full_name || "")}`,
        reference_id: candidate.id,
      }));

      if (rows.length) await adminSupabase.from("notifications").insert(rows);
    }
  }

  revalidatePath("/employers/candidates");
  revalidatePath(`/employers/candidates/${candidateId}`);
  revalidatePath("/admin/candidates");
  redirect(`/employers/candidates/${candidateId}?status_updated=1`);
}

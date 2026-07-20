import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

type HiringTargetInput = {
  requirementId: string;
  companyId?: string | null;
  employerId?: string | null;
  assignedRecruiterId?: string | null;
  candidateRecruiterId?: string | null;
  actorId?: string | null;
};

export type HiringNotificationRecipient = {
  userId: string;
  role: "employer" | "recruiter";
};

function isMissingRequirementAssignmentsTable(error: any) {
  const message = String(error?.message ?? "").toLowerCase();
  return error?.code === "42P01"
    || error?.code === "PGRST205"
    || (message.includes("requirement_recruiter_assignments") && (message.includes("schema cache") || message.includes("does not exist") || message.includes("could not find")));
}

export async function getHiringNotificationRecipients(input: HiringTargetInput) {
  const recipients = new Map<string, HiringNotificationRecipient>();

  const addRecipient = (userId: string | null | undefined, role: HiringNotificationRecipient["role"]) => {
    if (!userId || userId === input.actorId) return;
    const current = recipients.get(userId);
    if (!current || role === "employer") recipients.set(userId, { userId, role });
  };

  addRecipient(input.employerId, "employer");
  addRecipient(input.assignedRecruiterId, "recruiter");
  addRecipient(input.candidateRecruiterId, "recruiter");

  if (input.companyId) {
    const { data: employerMembers } = await adminSupabase
      .from("employer_team_members")
      .select("user_id")
      .eq("company_id", input.companyId)
      .eq("role", "employer")
      .eq("status", "active");

    (employerMembers ?? []).forEach((member: any) => {
      addRecipient(member.user_id, "employer");
    });
  }

  const { data: assignmentRows, error: assignmentError } = await adminSupabase
    .from("requirement_recruiter_assignments")
    .select("recruiter_id")
    .eq("requirement_id", input.requirementId);

  if (!assignmentError) {
    (assignmentRows ?? []).forEach((row: any) => {
      addRecipient(row.recruiter_id, "recruiter");
    });
  } else if (!isMissingRequirementAssignmentsTable(assignmentError)) {
    console.error("Hiring notification assignment lookup failed:", assignmentError.message);
  }

  return [...recipients.values()];
}

export async function getHiringNotificationTargets(input: HiringTargetInput) {
  return (await getHiringNotificationRecipients(input)).map((recipient) => recipient.userId);
}

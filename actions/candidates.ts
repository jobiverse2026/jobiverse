"use server";

import { requireRole } from "@/lib/auth/authorization";
import { getHiringNotificationRecipients } from "@/lib/hiring/notification-targets";
import { adminSupabase } from "@/lib/supabase/admin";

function isMissingRequirementAssignmentsTable(error: any) {
  const message = String(error?.message ?? "").toLowerCase();
  return error?.code === "42P01"
    || error?.code === "PGRST205"
    || (message.includes("requirement_recruiter_assignments") && (message.includes("schema cache") || message.includes("does not exist") || message.includes("could not find")));
}

export async function createCandidate(
  formData: FormData
) {

 const { supabase, user, profile } = await requireRole(["admin", "recruiter"]);

  const requirementId = String(formData.get("requirement_id") ?? "");

  if (!requirementId) {
    throw new Error("Requirement is required.");
  }

  const { data: requirement, error: requirementError } = await supabase
    .from("requirements")
    .select("id, assigned_recruiter, employer_id, company_id, job_title")
    .eq("id", requirementId)
    .maybeSingle();

  if (requirementError || !requirement) {
    throw new Error("Requirement not found or access denied.");
  }

  if (profile.role === "recruiter" && requirement.assigned_recruiter !== user.id) {
    const { data: assignment, error: assignmentError } = await adminSupabase
      .from("requirement_recruiter_assignments")
      .select("id")
      .eq("requirement_id", requirementId)
      .eq("recruiter_id", user.id)
      .maybeSingle();
    if (assignmentError && !isMissingRequirementAssignmentsTable(assignmentError)) throw new Error(assignmentError.message);
    if (!assignment) throw new Error("This requirement is not assigned to you.");
  }


  // Resume File

  const resume =
    formData.get("resume") as File;



  let resumePath = "";



  // Upload Resume

  if (resume && resume.size > 0) {


    const fileExt =
      resume.name.split(".").pop();



    const fileName = `${crypto.randomUUID()}.${fileExt}`;



    const filePath =
      `${user.id}/${fileName}`;



    const {
      error: uploadError
    } = await supabase
      .storage
      .from("candidate-resumes")
      .upload(
        filePath,
        resume
      );



   if (uploadError) {

  console.log(
    "UPLOAD ERROR:",
    uploadError
  );

  throw new Error(
    uploadError.message
  );

}



    resumePath = filePath;

  }



  const candidateData = {


    full_name:
      formData.get("full_name") as string,


    email:
      formData.get("email") as string,


    phone:
      formData.get("phone") as string,


    current_location:
      formData.get("current_location") as string,


    total_experience:
      formData.get("total_experience") as string,


    current_company:
      formData.get("current_company") as string,


    current_ctc:
      formData.get("current_ctc") as string,


    expected_ctc:
      formData.get("expected_ctc") as string,


    notice_period:
      formData.get("notice_period") as string,


    primary_skills:
      formData.get("primary_skills") as string,


    secondary_skills:
      formData.get("secondary_skills") as string,


    resume_path:
      resumePath || null,


    linkedin:
      formData.get("linkedin") as string,


    remarks:
      formData.get("remarks") as string,


    requirement_id: requirementId,


    recruiter_id: user.id,

    recruiter_name: profile.role === "admin" ? "JobiVerse Hiring Team" : profile.full_name,

    recruiter_email: profile.role === "admin" ? "jobiverse@outlook.com" : profile.email,

    status: profile.role === "admin" ? "Client Submitted" : "Submitted",

    source: profile.role === "admin" ? "jobiverse_hiring_team" : "recruiter",

  };



  const {
    data,
    error
  } = await supabase
    .from("candidates")
    .insert(candidateData)
    .select()
    .single();



  if(error){

    console.error(error);

    if (resumePath) {
      await supabase.storage.from("candidate-resumes").remove([resumePath]);
    }

    throw new Error(
      error.message
    );

  }

  const recipients = await getHiringNotificationRecipients({
    requirementId,
    companyId: requirement.company_id,
    employerId: requirement.employer_id,
    assignedRecruiterId: requirement.assigned_recruiter,
    candidateRecruiterId: user.id,
    actorId: user.id,
  });

  if (recipients.length) {
    await adminSupabase.from("notifications").insert(recipients.map((recipient) => ({
      user_id: recipient.userId,
      type: "candidate_submitted",
      title: profile.role === "admin" ? "New JobiVerse candidate submitted" : "New recruiter candidate submitted",
      message: `${candidateData.full_name || "A candidate"} has been submitted for ${requirement.job_title || "your requirement"} by ${candidateData.recruiter_name || profile.full_name || "the hiring team"}.`,
      href: recipient.role === "employer" ? `/employers/candidates/${data.id}` : `/recruiter/requirements/${requirement.id}`,
      reference_id: data.id,
    })));
  }



  return data;

}

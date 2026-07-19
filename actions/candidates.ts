"use server";

import { requireRole } from "@/lib/auth/authorization";


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
    .select("id, assigned_recruiter")
    .eq("id", requirementId)
    .maybeSingle();

  if (requirementError || !requirement) {
    throw new Error("Requirement not found or access denied.");
  }

  if (profile.role === "recruiter" && requirement.assigned_recruiter !== user.id) {
    throw new Error("This requirement is not assigned to you.");
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



  return data;

}

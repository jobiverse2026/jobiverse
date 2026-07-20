"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { requirementSchema } from "@/validation/requirement";
import { requireRole } from "@/lib/auth/authorization";
import { getEmployerCompanyAccess, scopeEmployerRequirementQuery } from "@/lib/employer-team/access";


export async function getRequirements() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }


  const access = await getEmployerCompanyAccess(user.id);
  const { data, error } = await scopeEmployerRequirementQuery(supabase
    .from("requirements")
    .select("*")
    .order("created_at", {
      ascending: false,
    }), access, user.id);


  if (error) {
    throw new Error(error.message);
  }


  return data;
}



export async function getRequirement(id: string) {
  const supabase = await createServerSupabaseClient();


  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) {
    throw new Error("Unauthorized");
  }


  const access = await getEmployerCompanyAccess(user.id);
  const { data, error } = await scopeEmployerRequirementQuery(supabase
    .from("requirements")
    .select("*")
    .eq("id", id), access, user.id).single();


  if (error) {
    throw new Error(error.message);
  }


  return data;
}

export async function getAssignableRequirementRecruiters() {
  const { user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);
  let memberQuery = adminSupabase
    .from("employer_team_members")
    .select("user_id,email,employer_id,users(id,full_name,email,avatar_url)")
    .eq("company_id", access.company.id)
    .eq("role", "recruiter")
    .eq("status", "active");

  if (!access.isMasterEmployer) memberQuery = memberQuery.eq("employer_id", user.id);

  const { data, error } = await memberQuery.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((member: any) => {
    const account = Array.isArray(member.users) ? member.users[0] : member.users;
    return {
      id: member.user_id,
      name: account?.full_name || account?.email || member.email,
      email: account?.email || member.email,
    };
  });
}




export async function createRequirement(values: unknown) {

  try {

    const { supabase, user } = await requireRole(["employer"]);


    console.log(
      "EMPLOYER USER:",
      user.id
    );



    console.log("RAW VALUES:", values);
    
    const parsed =
      requirementSchema.parse(values);



    console.log(
      "PARSED REQUIREMENT:",
      parsed
    );



    const access = await getEmployerCompanyAccess(user.id);
    const company = access.company;



    const insertData = {

      employer_id: user.id,

      company_id: company.id,

      status: "Open",

      job_title: parsed.job_title,
      department: parsed.department,
      employment_type: parsed.employment_type,
      work_mode: parsed.work_mode,
      experience: parsed.experience,
      vacancies: parsed.vacancies,
      budget_ctc: parsed.budget_ctc,
      location: parsed.location,
      notice_period: parsed.notice_period,
      primary_skills: parsed.skills,
      education: parsed.education,
      job_description: parsed.job_description ?? "Details to be confirmed",
      priority: parsed.priority.toLowerCase(),
      hiring_team_requested: parsed.assign_to_jobiverse,
      is_public: parsed.publish_to_jobs,
      published_at: parsed.publish_to_jobs ? new Date().toISOString() : null,

    };



    console.log(
      "INSERT DATA:",
      insertData
    );



    const {
      data,
      error,
    } =
      await supabase
        .from("requirements")
        .insert(insertData)
        .select()
        .single();



    if (error) {

      console.log(
        "INSERT ERROR:",
        error
      );

      throw new Error(
        error.message
      );

    }



    console.log(
      "CREATED REQUIREMENT:",
      data
    );



    return data;



  } catch(error) {


    console.error(
      "CREATE REQUIREMENT FAILED:",
      error
    );


    throw error;

  }

}





export async function updateRequirement(
  id: string,
  values: unknown
) {

  const supabase = await createServerSupabaseClient();


  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) {
    throw new Error("Unauthorized");
  }



  const parsed =
    requirementSchema.parse(values);



  const access = await getEmployerCompanyAccess(user.id);
  const {
    data,
    error,
  } =
    await scopeEmployerRequirementQuery(supabase
      .from("requirements")
      .update({
        job_title: parsed.job_title,
        department: parsed.department,
        employment_type: parsed.employment_type,
        work_mode: parsed.work_mode,
        experience: parsed.experience,
        vacancies: parsed.vacancies,
        budget_ctc: parsed.budget_ctc,
        location: parsed.location,
        notice_period: parsed.notice_period,
        primary_skills: parsed.skills,
        education: parsed.education,
        job_description: parsed.job_description,
        priority: parsed.priority.toLowerCase(),
        hiring_team_requested: parsed.assign_to_jobiverse,
        is_public: parsed.publish_to_jobs,
        published_at: parsed.publish_to_jobs ? new Date().toISOString() : null,

        updated_at:
          new Date().toISOString(),

      })

      .eq("id", id), access, user.id)

      .select()

      .single();



  if (error) {
    throw new Error(error.message);
  }



  return data;

}

export async function assignRequirementRecruiter(
  id: string,
  recruiterId: string
) {
  const { supabase, user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);
  const normalizedRecruiterId = recruiterId === "unassigned" ? "" : recruiterId;

  if (normalizedRecruiterId) {
    let memberQuery = adminSupabase
      .from("employer_team_members")
      .select("id,user_id,email")
      .eq("company_id", access.company.id)
      .eq("role", "recruiter")
      .eq("status", "active")
      .eq("user_id", normalizedRecruiterId);

    if (!access.isMasterEmployer) memberQuery = memberQuery.eq("employer_id", user.id);

    const { data: recruiter, error: recruiterError } = await memberQuery.maybeSingle();
    if (recruiterError) return { success: false, error: recruiterError.message };
    if (!recruiter) return { success: false, error: "Recruiter is not available in your assigned team." };
  }

  const { data, error } = await scopeEmployerRequirementQuery(
    supabase
      .from("requirements")
      .update({
        assigned_recruiter: normalizedRecruiterId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id),
    access,
    user.id
  )
    .select()
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Requirement not found or access denied." };

  revalidatePath(`/employers/requirements/${id}`);
  revalidatePath("/employers/requirements");
  revalidatePath("/employers/dashboard");
  revalidatePath("/recruiter/requirements");
  return { success: true, data };
}





export async function deleteRequirement(
  id: string
) {

  const supabase =
    await createServerSupabaseClient();



  const {
    data: { user },
  } =
    await supabase.auth.getUser();



  if (!user) {
    throw new Error("Unauthorized");
  }



  const access = await getEmployerCompanyAccess(user.id);
  const {
    error,
  } =
    await scopeEmployerRequirementQuery(supabase
      .from("requirements")
      .delete()
      .eq("id", id), access, user.id);



  if (error) {
    throw new Error(error.message);
  }



  return true;

}

export async function updateRequirementStatus(
  id: string,
  status: string
) {
  const allowedStatuses = ["Open", "Sourcing", "Interview", "Offer", "Joined", "Closed", "On Hold", "Cancelled"];
  if (!allowedStatuses.includes(status)) return { success: false, error: "Invalid requirement status." };
  const { supabase, user } = await requireRole(["employer"]);


  const access = await getEmployerCompanyAccess(user.id);
  const {
    data,
    error,
  } = await scopeEmployerRequirementQuery(supabase
    .from("requirements")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id), access, user.id)
    .select()
    .maybeSingle();


  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }
  if (!data) return { success: false, error: "Requirement not found or access denied." };


  revalidatePath(`/employers/requirements/${id}`);
  revalidatePath("/employers/requirements");
  revalidatePath(`/admin/requirements/${id}`);
  revalidatePath("/candidates/jobs");
  return {
    success: true,
    data,
  };
}

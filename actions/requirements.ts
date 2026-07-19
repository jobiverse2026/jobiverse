"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirementSchema } from "@/validation/requirement";
import { requireRole } from "@/lib/auth/authorization";


export async function getRequirements() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }


  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("employer_id", user.id)
    .order("created_at", {
      ascending: false,
    });


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


  const { data, error } = await supabase
    .from("requirements")
    .select("*")
    .eq("id", id)
    .eq("employer_id", user.id)
    .single();


  if (error) {
    throw new Error(error.message);
  }


  return data;
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



    const {
      data: company,
      error: companyError,
    } =
      await supabase
        .from("companies")
        .select("id, company_name, owner_id")
        .eq("owner_id", user.id)
        .maybeSingle();



    if (companyError) {

      console.log(
        "COMPANY ERROR:",
        companyError
      );

      throw new Error(
        companyError.message
      );
    }



    console.log(
      "COMPANY FOUND:",
      company
    );



    if (!company) {

      throw new Error(
        "Please complete your Company Profile before creating a requirement."
      );

    }



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



  const {
    data,
    error,
  } =
    await supabase
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

        updated_at:
          new Date().toISOString(),

      })

      .eq("id", id)

      .eq("employer_id", user.id)

      .select()

      .single();



  if (error) {
    throw new Error(error.message);
  }



  return data;

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



  const {
    error,
  } =
    await supabase
      .from("requirements")
      .delete()
      .eq("id", id)
      .eq("employer_id", user.id);



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


  const {
    data,
    error,
  } = await supabase
    .from("requirements")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("employer_id", user.id)
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

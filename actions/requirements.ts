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
    .select("user_id,email,employer_id,created_at")
    .eq("company_id", access.company.id)
    .eq("role", "recruiter")
    .eq("status", "active");

  const { data, error } = await memberQuery.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const userIds = [...new Set((data ?? []).map((member: any) => member.user_id).filter(Boolean))];
  const { data: profiles, error: profileError } = userIds.length
    ? await adminSupabase.from("users").select("id,full_name,email,avatar_url").in("id", userIds)
    : { data: [], error: null };
  if (profileError) throw new Error(profileError.message);
  const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.id, profile]));

  return (data ?? []).map((member: any) => {
    const account = profileMap.get(member.user_id);
    return {
      id: member.user_id,
      name: account?.full_name || account?.email || member.email,
      email: account?.email || member.email,
    };
  });
}

export async function getRequirementRecruiterAssignments(requirementId: string) {
  const { user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);
  const { data: requirement, error: requirementError } = await scopeEmployerRequirementQuery(
    adminSupabase.from("requirements").select("id,assigned_recruiter").eq("id", requirementId),
    access,
    user.id
  ).maybeSingle();
  if (requirementError) throw new Error(requirementError.message);
  if (!requirement) throw new Error("Requirement not found or access denied.");

  const { data, error } = await adminSupabase
    .from("requirement_recruiter_assignments")
    .select("recruiter_id")
    .eq("requirement_id", requirementId);
  if (error) {
    if (error.code === "42P01") return requirement.assigned_recruiter ? [requirement.assigned_recruiter] : [];
    throw new Error(error.message);
  }
  const assigned = (data ?? []).map((row: any) => row.recruiter_id).filter(Boolean);
  if (!assigned.length && requirement.assigned_recruiter) return [requirement.assigned_recruiter];
  return assigned;
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

export async function assignRequirementRecruiters(
  id: string,
  recruiterIds: string[]
) {
  const { supabase, user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);
  const selectedRecruiterIds = [...new Set((recruiterIds ?? []).filter((id) => /^[0-9a-f-]{36}$/i.test(id)))];

  const { data: requirement, error: readError } = await scopeEmployerRequirementQuery(
    supabase
      .from("requirements")
      .select("id,job_title,employer_id,assigned_recruiter,status")
      .eq("id", id),
    access,
    user.id
  ).maybeSingle();
  if (readError) return { success: false, error: readError.message };
  if (!requirement) return { success: false, error: "Requirement not found or access denied." };

  if (selectedRecruiterIds.length) {
    const { data: recruiters, error: recruiterError } = await adminSupabase
      .from("employer_team_members")
      .select("user_id,email")
      .eq("company_id", access.company.id)
      .eq("role", "recruiter")
      .eq("status", "active")
      .in("user_id", selectedRecruiterIds);

    if (recruiterError) return { success: false, error: recruiterError.message };
    const available = new Set((recruiters ?? []).map((row: any) => row.user_id));
    const unavailable = selectedRecruiterIds.filter((recruiterId) => !available.has(recruiterId));
    if (unavailable.length) return { success: false, error: "One or more selected recruiters are not active in this company workspace." };
  }

  const { data: existingRows, error: existingError } = await adminSupabase
    .from("requirement_recruiter_assignments")
    .select("recruiter_id")
    .eq("requirement_id", id);
  if (existingError) return { success: false, error: existingError.message };

  const existingIds = new Set((existingRows ?? []).map((row: any) => row.recruiter_id));
  const selectedIds = new Set(selectedRecruiterIds);
  const toAdd = selectedRecruiterIds.filter((recruiterId) => !existingIds.has(recruiterId));
  const toRemove = [...existingIds].filter((recruiterId) => !selectedIds.has(String(recruiterId)));
  const now = new Date().toISOString();

  if (toRemove.length) {
    const { error: deleteError } = await adminSupabase
      .from("requirement_recruiter_assignments")
      .delete()
      .eq("requirement_id", id)
      .in("recruiter_id", toRemove);
    if (deleteError) return { success: false, error: deleteError.message };
  }

  if (toAdd.length) {
    const { error: insertError } = await adminSupabase
      .from("requirement_recruiter_assignments")
      .insert(toAdd.map((recruiterId) => ({ requirement_id: id, recruiter_id: recruiterId, assigned_by: user.id })));
    if (insertError) return { success: false, error: insertError.message };
  }

  const primaryRecruiter = selectedRecruiterIds[0] ?? null;
  const { data, error } = await scopeEmployerRequirementQuery(
    supabase
      .from("requirements")
      .update({
        assigned_recruiter: primaryRecruiter,
        status: primaryRecruiter ? "Assigned" : requirement.status,
        updated_at: now,
      })
      .eq("id", id),
    access,
    user.id
  )
    .select()
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: "Requirement not found or access denied." };

  const notifications = [
    ...toAdd.map((recruiterId) => ({
      user_id: recruiterId,
      type: "requirement_assigned",
      title: "New role assigned",
      message: `You were assigned to ${requirement.job_title}.`,
      href: `/recruiter/requirements/${id}`,
      reference_id: id,
    })),
    ...toRemove.map((recruiterId) => ({
      user_id: String(recruiterId),
      type: "requirement_unassigned",
      title: "Role assignment removed",
      message: `You were removed from ${requirement.job_title}.`,
      href: "/recruiter/requirements",
      reference_id: id,
    })),
  ];
  const employerNotificationTargets = [...new Set([requirement.employer_id, access.company.owner_id].filter(Boolean))].filter((targetId) => targetId !== user.id);
  notifications.push(...employerNotificationTargets.map((targetId) => ({
    user_id: targetId,
    type: "requirement_assignment_updated",
    title: "Requirement assignment updated",
    message: `${requirement.job_title} now has ${selectedRecruiterIds.length} assigned recruiter${selectedRecruiterIds.length === 1 ? "" : "s"}.`,
    href: `/employers/requirements/${id}`,
    reference_id: id,
  })));
  if (notifications.length) await adminSupabase.from("notifications").insert(notifications);

  revalidatePath(`/employers/requirements/${id}`);
  revalidatePath("/employers/requirements");
  revalidatePath("/employers/dashboard");
  revalidatePath("/recruiter/requirements");
  selectedRecruiterIds.forEach((recruiterId) => revalidatePath(`/recruiter/requirements/${id}`));
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

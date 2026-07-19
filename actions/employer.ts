"use server";

import { requireRole } from "@/lib/auth/authorization";
import { employerSchema } from "@/validation/employer";

export async function submitEmployerRequirement(values: unknown) {
  const data = employerSchema.parse(values);
  const { supabase, user } = await requireRole(["employer"]);

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .upsert(
      {
        owner_id: user.id,
        company_name: data.companyName,
        company_email: data.email,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        company_size: data.companySize,
        location: data.companyLocation,
        city: data.companyLocation,
      },
      { onConflict: "owner_id" }
    )
    .select("id")
    .single();

  if (companyError || !company) {
    return { success: false, error: companyError?.message ?? "Company could not be saved." };
  }

  const vacancies = Number.parseInt(data.openings ?? "1", 10);
  const { error } = await supabase.from("requirements").insert({
    employer_id: user.id,
    company_id: company.id,
    job_title: data.jobTitle,
    department: data.department,
    experience: data.experience,
    employment_type: data.employmentType,
    work_mode: data.workMode,
    budget_ctc: data.salary,
    vacancies: Number.isFinite(vacancies) && vacancies > 0 ? vacancies : 1,
    location: data.hiringLocation,
    primary_skills: data.primarySkills,
    secondary_skills: data.secondarySkills,
    job_description: data.jobDescription,
    additional_information: data.additionalInformation,
    status: "Open",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

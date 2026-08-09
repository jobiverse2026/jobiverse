"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { getEmployerCompanyAccess, scopeEmployerRequirementQuery } from "@/lib/employer-team/access";
import { analyzeJobQuality } from "@/lib/jobs/job-quality";

export async function setRequirementPublished(requirementId: string, published: boolean) {
  const { supabase, user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);
  const { data: requirement } = await scopeEmployerRequirementQuery(supabase.from("requirements").select("job_title,job_description,budget_ctc,experience,primary_skills,location,employment_type,work_mode,education").eq("id", requirementId), access, user.id).maybeSingle();
  if (!requirement) throw new Error("Requirement not found or access denied.");
  const quality = analyzeJobQuality({ ...requirement, skills: requirement.primary_skills });
  if (published && !quality.canPublish) throw new Error(`Fix critical job quality issues before publishing: ${quality.issues.filter(issue=>issue.severity==="critical").map(issue=>issue.title).join(", ")}.`);
  const { error } = await scopeEmployerRequirementQuery(supabase
    .from("requirements")
    .update({ is_public: published, published_at: published ? new Date().toISOString() : null, quality_score: quality.score, quality_grade: quality.grade, quality_issues: quality.issues, quality_checked_at: new Date().toISOString() })
    .eq("id", requirementId), access, user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/employers/requirements/${requirementId}`);
  revalidatePath("/employers/requirements");
  revalidatePath("/candidates/jobs");
  revalidatePath(`/admin/requirements/${requirementId}`);
}

export async function requestJobiVerseHiringTeam(requirementId: string) {
  const { supabase, user, profile } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);
  const { data: requirement, error } = await scopeEmployerRequirementQuery(supabase
    .from("requirements")
    .update({ hiring_team_requested: true, updated_at: new Date().toISOString() })
    .eq("id", requirementId)
    .select("id,job_title,hiring_team_requested")
    , access, user.id).maybeSingle();

  if (error) throw new Error(error.message);
  if (!requirement) throw new Error("Requirement not found or access denied.");

  const { data: admins } = await adminSupabase.from("users").select("id").eq("role", "admin");
  if (admins?.length) {
    await adminSupabase.from("notifications").insert(
      admins.map((admin) => ({
        user_id: admin.id,
        type: "requirement_assigned_jobiverse",
        title: "Requirement assigned to JobiVerse",
        message: `${profile.full_name || profile.email || "An employer"} requested JobiVerse Hiring Team support for ${requirement.job_title}.`,
        href: `/admin/requirements/${requirement.id}`,
        reference_id: requirement.id,
      }))
    );
  }

  revalidatePath(`/employers/requirements/${requirementId}`);
  revalidatePath("/employers/requirements");
  revalidatePath("/employers/dashboard");
  revalidatePath(`/admin/requirements/${requirementId}`);
  revalidatePath("/admin/requirements");
}

"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export async function setRequirementPublished(requirementId: string, published: boolean) {
  const { supabase, user } = await requireRole(["employer"]);
  const { error } = await supabase
    .from("requirements")
    .update({ is_public: published, published_at: published ? new Date().toISOString() : null })
    .eq("id", requirementId)
    .eq("employer_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/employers/requirements/${requirementId}`);
  revalidatePath("/employers/requirements");
  revalidatePath("/candidates/jobs");
  revalidatePath(`/admin/requirements/${requirementId}`);
}

export async function requestJobiVerseHiringTeam(requirementId: string) {
  const { supabase, user, profile } = await requireRole(["employer"]);
  const { data: requirement, error } = await supabase
    .from("requirements")
    .update({ hiring_team_requested: true, updated_at: new Date().toISOString() })
    .eq("id", requirementId)
    .eq("employer_id", user.id)
    .select("id,job_title,hiring_team_requested")
    .maybeSingle();

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

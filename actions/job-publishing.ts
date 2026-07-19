"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";
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

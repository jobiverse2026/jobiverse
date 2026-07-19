"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";
export async function setRequirementPublished(requirementId: string, published: boolean) { const { supabase } = await requireRole(["admin"]); const { error } = await supabase.from("requirements").update({ is_public: published, published_at: published ? new Date().toISOString() : null }).eq("id", requirementId); if(error) throw new Error(error.message); revalidatePath(`/admin/requirements/${requirementId}`); revalidatePath("/candidates/jobs"); }

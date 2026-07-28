"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";

export async function updateFeedback(formData: FormData) {
  const { supabase } = await requireRole(["admin"]);
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["new", "reviewing", "planned", "resolved", "dismissed"]), adminNote: z.string().trim().max(2000).optional() }).parse({ id: formData.get("id"), status: formData.get("status"), adminNote: formData.get("adminNote") || undefined });
  const { error } = await supabase.from("user_feedback").update({ status: parsed.status, admin_note: parsed.adminNote || null }).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/feedback");
}


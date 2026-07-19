"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export async function resolveJobReport(formData: FormData) {
  const { user } = await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("reportId"));
  const status = z.enum(["reviewing", "resolved", "dismissed"]).parse(formData.get("status"));
  const note = z.string().trim().min(5, "Add a clear moderation note.").max(1000).parse(formData.get("adminNote"));
  const { error } = await adminSupabase.from("job_reports").update({ status, admin_note: note, reviewed_by: user.id, reviewed_at: status === "reviewing" ? null : new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/trust-safety");
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const schema = z.object({ userId: z.string().uuid(), action: z.enum(["suspend", "restore", "verify_email"]) });

export async function updatePlatformUser(formData: FormData) {
  const parsed = schema.safeParse({ userId: formData.get("userId"), action: formData.get("action") });
  if (!parsed.success) throw new Error("Invalid user action.");
  const { user } = await requireRole(["admin"]);
  if (parsed.data.userId === user.id) throw new Error("You cannot restrict your own admin account.");
  const { data: target } = await adminSupabase.from("users").select("id,role,email").eq("id", parsed.data.userId).maybeSingle();
  if (!target) throw new Error("User not found.");
  if (target.role === "admin" && parsed.data.action === "suspend") throw new Error("Admin accounts cannot be suspended here.");

  if (parsed.data.action === "suspend") {
    const { error } = await adminSupabase.auth.admin.updateUserById(target.id, { ban_duration: "876000h" });
    if (error) throw new Error(error.message);
    const { error: profileError } = await adminSupabase.from("users").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", target.id);
    if (profileError) throw new Error(profileError.message);
  } else if (parsed.data.action === "restore") {
    const { error } = await adminSupabase.auth.admin.updateUserById(target.id, { ban_duration: "none" });
    if (error) throw new Error(error.message);
    const { error: profileError } = await adminSupabase.from("users").update({ is_active: true, updated_at: new Date().toISOString() }).eq("id", target.id);
    if (profileError) throw new Error(profileError.message);
  } else {
    const { error } = await adminSupabase.auth.admin.updateUserById(target.id, { email_confirm: true });
    if (error) throw new Error(error.message);
  }
  await adminSupabase.from("audit_logs").insert({ actor_id: user.id, action: `admin_user_${parsed.data.action}`, entity_type: "user", entity_id: target.id, after_data: { email: target.email, action: parsed.data.action } });
  revalidatePath("/admin/users");
  revalidatePath("/admin/growth");
}

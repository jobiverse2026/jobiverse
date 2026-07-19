"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

export async function verifyPayoutProfile(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("profileId"));
  const status = z.enum(["verified", "rejected"]).parse(formData.get("status"));
  const note = z.string().trim().max(1000).parse(String(formData.get("adminNote") ?? ""));
  if (status === "rejected" && note.length < 5) throw new Error("Add a clear rejection reason.");
  const { supabase, user } = await requireRole(["admin"]);
  const { error } = await supabase.from("creator_payout_profiles").update({
    status,
    admin_note: note || null,
    verified_by: status === "verified" ? user.id : null,
    verified_at: status === "verified" ? new Date().toISOString() : null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/payout-accounts");
  revalidatePath("/earn-with-jobiverse/dashboard/payout-profile");
}

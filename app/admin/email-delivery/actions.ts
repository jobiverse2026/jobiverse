"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export async function retryEmailDelivery(formData: FormData) {
  await requireRole(["admin"]);
  const id = z.string().uuid().parse(formData.get("emailId"));
  const now = new Date().toISOString();

  const { data: email, error: readError } = await adminSupabase
    .from("transactional_email_outbox")
    .select("id,notification_id,status")
    .eq("id", id)
    .single();

  if (readError || !email) throw new Error(readError?.message ?? "Email delivery record not found.");
  if (email.status !== "failed") throw new Error("Only failed email deliveries can be retried.");

  const { error } = await adminSupabase
    .from("transactional_email_outbox")
    .update({
      status: "queued",
      next_attempt_at: now,
      processing_started_at: null,
      last_error: null,
      updated_at: now,
    })
    .eq("id", id)
    .eq("status", "failed");

  if (error) throw new Error(error.message);

  if (email.notification_id) {
    await adminSupabase
      .from("notifications")
      .update({ email_status: "pending" })
      .eq("id", email.notification_id);
  }

  revalidatePath("/admin/email-delivery");
}

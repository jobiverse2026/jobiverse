"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notificationCategories } from "@/lib/notifications/preferences";

export async function saveNotificationPreferences(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/candidate?next=/account/notifications");

  const values: Record<string, boolean | string> = { user_id: user.id, marketing_email: formData.get("marketing_email") === "on", updated_at: new Date().toISOString() };
  for (const category of notificationCategories) {
    values[`in_app_${category}`] = formData.get(`in_app_${category}`) === "on";
    values[`email_${category}`] = formData.get(`email_${category}`) === "on";
  }
  const { error } = await supabase.from("notification_preferences").upsert(values, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  redirect("/account/notifications?saved=1");
}

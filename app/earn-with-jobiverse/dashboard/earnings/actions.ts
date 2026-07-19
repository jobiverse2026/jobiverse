"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requestPayout() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in to request a payout.");
  const { data: payoutProfile } = await supabase
    .from("creator_payout_profiles")
    .select("status")
    .eq("creator_id", user.id)
    .maybeSingle();
  if (payoutProfile?.status !== "verified") {
    throw new Error("Add and verify your bank payout profile before requesting a payout.");
  }
  const { error } = await supabase.rpc("request_creator_payout");
  if (error) throw new Error(error.message);
  revalidatePath("/earn-with-jobiverse/dashboard/earnings");
  revalidatePath("/admin/finance");
}

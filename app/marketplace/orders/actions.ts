"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { platformMargin } from "@/lib/marketplace/pricing";

export async function respondToCounterOffer(formData: FormData) {
  const offerId = String(formData.get("offerId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(offerId) || !["accept", "reject"].includes(decision)) throw new Error("Invalid counteroffer response.");
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login/candidate?next=/marketplace/orders");
  const { data: offer, error: readError } = await supabase.from("marketplace_offers").select("id,status,counter_customer_amount,counter_creator_earning").eq("id", offerId).eq("customer_id", user.id).maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!offer || offer.status !== "countered") throw new Error("This counteroffer is no longer available.");
  if (decision === "reject") {
    const { error } = await supabase.from("marketplace_offers").update({ status: "rejected" }).eq("id", offer.id).eq("customer_id", user.id).eq("status", "countered");
    if (error) throw new Error(error.message);
    revalidatePath("/marketplace/orders");
    return;
  }
  const customerAmount = Number(offer.counter_customer_amount);
  const creatorEarning = Number(offer.counter_creator_earning);
  if (!Number.isFinite(customerAmount) || !Number.isFinite(creatorEarning)) throw new Error("The counteroffer amount is incomplete.");
  const { error } = await supabase.from("marketplace_offers").update({ status: "accepted", customer_offer: customerAmount, creator_earning: creatorEarning, platform_margin: platformMargin(customerAmount, creatorEarning) }).eq("id", offer.id).eq("customer_id", user.id).eq("status", "countered");
  if (error) throw new Error(error.message);
  revalidatePath("/marketplace/orders");
  revalidatePath("/earn-with-jobiverse/dashboard/offers");
  redirect(`/marketplace/checkout?offer=${offer.id}`);
}

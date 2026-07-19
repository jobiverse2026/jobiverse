"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { customerOfferFromCreatorEarning } from "@/lib/marketplace/pricing";

export async function respondToOffer(formData: FormData) {
  const offerId = String(formData.get("offerId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(offerId) || !["accepted", "rejected", "countered"].includes(decision)) throw new Error("Invalid negotiation response.");
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in again.");
  const { data: offer, error: offerError } = await supabase.from("marketplace_offers").select("id,status,provider_id,expires_at").eq("id", offerId).eq("provider_id", user.id).maybeSingle();
  if (offerError) throw new Error(offerError.message);
  if (!offer) throw new Error("This negotiation is unavailable.");
  if (offer.status !== "pending") throw new Error("This negotiation has already been answered.");
  if (new Date(offer.expires_at) <= new Date()) throw new Error("This negotiation has expired.");
  let updateError: { message: string } | null = null;
  if (decision === "countered") {
    const creatorNet = Number(formData.get("creatorNet"));
    if (!Number.isFinite(creatorNet) || creatorNet < 75 || creatorNet > 750000) throw new Error("Enter a valid counter earning.");
    const customerAmount = customerOfferFromCreatorEarning(creatorNet);
    const result = await supabase.from("marketplace_offers").update({ status: "countered", counter_creator_earning: creatorNet, counter_customer_amount: customerAmount }).eq("id", offerId).eq("provider_id", user.id).select("id").single();
    updateError = result.error;
  } else {
    const result = await supabase.from("marketplace_offers").update({ status: decision }).eq("id", offerId).eq("provider_id", user.id).select("id").single();
    updateError = result.error;
  }
  if (updateError) throw new Error(updateError.message);
  revalidatePath("/earn-with-jobiverse/dashboard/offers");
  revalidatePath("/marketplace/offers");
}

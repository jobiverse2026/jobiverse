"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { creatorEarningFromCustomerOffer, platformMargin } from "@/lib/marketplace/pricing";
import { canBuyMarketplaceService, requiredBuyerPortal } from "@/lib/marketplace/buyer-access";

export type OfferState = { error?: string; success?: string };

const schema = z.object({
  listingId: z.string().uuid(),
  amount: z.coerce.number().min(100, "Minimum offer is INR 100.").max(1000000),
  message: z.string().trim().max(1000).optional(),
});

export async function createServiceOffer(_state: OfferState, formData: FormData): Promise<OfferState> {
  const parsed = schema.safeParse({
    listingId: formData.get("listingId"),
    amount: formData.get("amount"),
    message: formData.get("message"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your offer." };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please log in before making an offer." };

  const [{ data: profile }, { data: listing }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).maybeSingle(),
    supabase
      .from("marketplace_services")
      .select("id,provider_id,audience,status")
      .eq("id", parsed.data.listingId)
      .eq("status", "published")
      .maybeSingle(),
  ]);

  if (!listing) return { error: "This service is no longer available." };

  const requiredRole = requiredBuyerPortal(listing.audience);
  const activeRole = profile?.role ?? (typeof user.user_metadata?.role === "string" ? user.user_metadata.role : null);
  if (!canBuyMarketplaceService(activeRole, listing.audience)) {
    return { error: `Please use a ${requiredRole} account for this service.` };
  }

  if (listing.provider_id === user.id) return { error: "You cannot negotiate on your own service." };

  const creatorEarning = creatorEarningFromCustomerOffer(parsed.data.amount);
  const { error } = await supabase.from("marketplace_offers").insert({
    service_id: listing.id,
    customer_id: user.id,
    provider_id: listing.provider_id,
    customer_offer: parsed.data.amount,
    creator_earning: creatorEarning,
    platform_margin: platformMargin(parsed.data.amount, creatorEarning),
    message: parsed.data.message || null,
    status: "pending",
  });

  if (error) {
    return { error: error.code === "23505" ? "You already have an active offer for this service." : error.message };
  }

  return { success: "Negotiation sent successfully. You can track the reply inside My Orders." };
}

"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { customerPrice, platformMargin } from "@/lib/marketplace/pricing";
import { canBuyMarketplaceService, requiredBuyerPortal } from "@/lib/marketplace/buyer-access";

export type BookingState = { error?: string };
const schema = z.object({ listingId: z.string().uuid(), requirements: z.string().trim().min(20, "Please share at least 20 characters about your requirements.").max(3000) });

export async function createMarketplaceOrder(_state: BookingState, formData: FormData): Promise<BookingState> {
  const parsed = schema.safeParse({ listingId: formData.get("listingId"), requirements: formData.get("requirements") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your requirements." };
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in before booking this service." };
  const [{ data: profile }, { data: listing }] = await Promise.all([
    supabase.from("users").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("marketplace_services").select("id,provider_id,price,audience,status").eq("id", parsed.data.listingId).eq("status", "published").maybeSingle(),
  ]);
  if (!listing) return { error: "This service is no longer available." };
  const requiredRole = requiredBuyerPortal(listing.audience);
  if (!canBuyMarketplaceService(profile?.role, listing.audience)) return { error: `Please use a ${requiredRole} account to book this service.` };
  if (listing.provider_id === user.id) return { error: "You cannot book your own service." };
  const creatorEarning = Number(listing.price);
  const finalAmount = customerPrice(creatorEarning);
  const { data: order, error } = await supabase.from("marketplace_orders").insert({ service_id: listing.id, customer_id: user.id, provider_id: listing.provider_id, amount: finalAmount, creator_earning: creatorEarning, platform_margin: platformMargin(finalAmount, creatorEarning), requirements: parsed.data.requirements, status: "pending_payment" }).select("id").single();
  if (error) return { error: error.message };
  redirect(`/marketplace/checkout?order=${order.id}`);
}

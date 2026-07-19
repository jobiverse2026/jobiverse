"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getJobiVerseOffer } from "@/lib/marketplace/jobiverse-offerings";

export type JobiVerseBookingState = { error?: string; success?: string };

const schema = z.object({
  category: z.string().min(2).max(100),
  requirements: z.string().trim().min(20).max(3000),
});

export async function createJobiVerseOrder(_state: JobiVerseBookingState, formData: FormData): Promise<JobiVerseBookingState> {
  const parsed = schema.safeParse({
    category: formData.get("category"),
    requirements: formData.get("requirements"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your requirements." };

  const offer = getJobiVerseOffer(parsed.data.category);
  if (!offer) return { error: "This JobiVerse service is unavailable." };
  if (offer.price <= 0) return { error: "This service requires a negotiated commercial proposal." };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to continue." };

  const { data: order, error } = await supabase
    .from("marketplace_orders")
    .insert({
      customer_id: user.id,
      provider_id: null,
      service_id: null,
      provider_type: "jobiverse",
      service_title: parsed.data.category,
      service_category: parsed.data.category,
      amount: offer.price,
      creator_earning: 0,
      platform_margin: offer.price,
      requirements: parsed.data.requirements,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  redirect(`/marketplace/checkout?order=${order.id}`);
}

export async function createJobiVerseNegotiation(_state: JobiVerseBookingState, formData: FormData): Promise<JobiVerseBookingState> {
  const category = String(formData.get("category") ?? "");
  const amount = Number(formData.get("amount"));
  const message = String(formData.get("requirements") ?? "").trim();

  if (!getJobiVerseOffer(category)) return { error: "This JobiVerse service is unavailable." };
  if (!Number.isFinite(amount) || amount < 100) return { error: "Enter a valid negotiated amount of at least INR 100." };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to continue." };

  const { error } = await supabase.from("marketplace_offers").insert({
    customer_id: user.id,
    provider_id: null,
    service_id: null,
    provider_type: "jobiverse",
    service_title: category,
    service_category: category,
    customer_offer: amount,
    creator_earning: 0,
    platform_margin: amount,
    message: message || null,
    status: "pending",
  });

  if (error) return { error: error.message };
  return { success: "Negotiation sent to JobiVerse successfully. You can track the reply inside My Orders." };
}

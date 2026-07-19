"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export type ConsultationState = { error?: string };
const schema = z.object({ slug: z.string().min(2).max(80), scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), scheduledHour: z.coerce.number().int().min(1).max(12), scheduledMinute: z.enum(["00","15","30","45"]), scheduledPeriod: z.enum(["AM","PM"]), phone: z.string().trim().max(30).optional(), goals: z.string().trim().min(20, "Tell us your goal in at least 20 characters.").max(2000) });

export async function bookConsultation(_state: ConsultationState, formData: FormData): Promise<ConsultationState> {
  const parsed = schema.safeParse({ slug: formData.get("slug"), scheduledDate: formData.get("scheduledDate"), scheduledHour: formData.get("scheduledHour"), scheduledMinute: formData.get("scheduledMinute"), scheduledPeriod: formData.get("scheduledPeriod"), phone: String(formData.get("phone") ?? ""), goals: formData.get("goals") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the booking details." };
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to book a consultation." };
  const [{ data: profile }, { data: type }] = await Promise.all([
    supabase.from("users").select("full_name,email,phone,role,is_active").eq("id", user.id).maybeSingle(),
    supabase.from("consultation_types").select("id,slug,title,audience,duration_minutes,price,is_active").eq("slug", parsed.data.slug).maybeSingle(),
  ]);
  if (!profile?.is_active || !type?.is_active) return { error: "This consultation is currently unavailable." };
  if (!type.audience.includes(profile.role)) return { error: "This consultation is not available for your account role." };
  const hour24 = parsed.data.scheduledHour % 12 + (parsed.data.scheduledPeriod === "PM" ? 12 : 0);
  const scheduledAt = new Date(`${parsed.data.scheduledDate}T${String(hour24).padStart(2,"0")}:${parsed.data.scheduledMinute}:00+05:30`);
  if (Number.isNaN(scheduledAt.getTime())) return { error: "Select a valid consultation date and time." };
  const now = Date.now();
  if (scheduledAt.getTime() < now + 4 * 60 * 60 * 1000) return { error: "Choose a slot at least 4 hours from now." };
  if (scheduledAt.getTime() > now + 45 * 24 * 60 * 60 * 1000) return { error: "Choose a slot within the next 45 days." };
  const indiaParts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", hour12: false }).formatToParts(scheduledAt);
  const weekday = indiaParts.find((part) => part.type === "weekday")?.value;
  const hour = Number(indiaParts.find((part) => part.type === "hour")?.value);
  if (weekday === "Sun" || hour < 9 || hour >= 19) return { error: "Consultations are available Monday to Saturday, 9:00 AM to 7:00 PM IST." };
  const price = Number(type.price);
  let orderId: string | null = null;
  if (price > 0) {
    const { data: order, error: orderError } = await supabase.from("marketplace_orders").insert({ customer_id: user.id, provider_id: null, service_id: null, provider_type: "jobiverse", service_title: type.title, service_category: "JobiVerse Consultation", amount: price, creator_earning: 0, platform_margin: price, requirements: parsed.data.goals, status: "pending_payment" }).select("id").single();
    if (orderError) return { error: orderError.message };
    orderId = order.id;
  }
  const { data: booking, error } = await supabase.from("consultation_bookings").insert({ consultation_type_id: type.id, user_id: user.id, marketplace_order_id: orderId, scheduled_at: scheduledAt.toISOString(), duration_minutes: type.duration_minutes, customer_name: profile.full_name || "JobiVerse member", customer_email: profile.email, customer_phone: parsed.data.phone || profile.phone || null, goals: parsed.data.goals, status: price > 0 ? "pending_payment" : "requested", payment_status: price > 0 ? "pending" : "not_required" }).select("id").single();
  if (error) {
    if (orderId) await adminSupabase.from("marketplace_orders").delete().eq("id", orderId).eq("status", "pending_payment");
    return { error: error.code === "23505" ? "That slot was just booked. Please choose another time." : error.message };
  }
  const { data: admins } = await supabase.from("users").select("id").eq("role", "admin");
  if (admins?.length) await adminSupabase.from("notifications").insert(admins.map((admin) => ({ user_id: admin.id, type: "consultation_booked", title: "New JobiVerse consultation", message: `${profile.full_name || profile.email} requested ${type.title}.`, href: `/admin/consultations?booking=${booking.id}`, reference_id: booking.id })));
  if (orderId) redirect(`/marketplace/checkout?order=${orderId}&returnTo=${encodeURIComponent(`/consultations/${type.slug}`)}`);
  redirect(`/consultations/my?booked=${booking.id}`);
}

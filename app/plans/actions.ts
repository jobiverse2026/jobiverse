"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { planChecklist } from "@/lib/plans/deliverables";

export async function requestPlan(formData: FormData) {
  const planId = z.string().uuid().parse(formData.get("planId"));
  const { user, supabase, profile } = await requireRole(["candidate", "employer"]);
  const { data: plan, error: readError } = await supabase
    .from("platform_plans")
    .select("id,slug,audience,name,price,billing_interval")
    .eq("id", planId)
    .eq("is_active", true)
    .single();

  if (readError || !plan) throw new Error("This plan is unavailable.");
  if (plan.audience !== profile.role) throw new Error("This plan is not available for your account type.");

  const { data: subscription, error } = await supabase
    .from("platform_subscriptions")
    .insert({ user_id: user.id, plan_id: plan.id, status: "requested" })
    .select("id")
    .single();

  if (error?.code === "23505") throw new Error("You already have an open request or active subscription for this plan.");
  if (error) throw new Error(error.message);

  const checklist = planChecklist(plan.slug, plan.name);
  const priceText = Number(plan.price) > 0 ? `₹${Number(plan.price).toLocaleString("en-IN")} / ${plan.billing_interval}` : plan.billing_interval === "custom" ? "custom pricing" : "free";
  const { data: admins } = await adminSupabase.from("users").select("id").eq("role", "admin").eq("is_active", true);
  if (admins?.length) {
    await adminSupabase.from("notifications").insert(
      admins.map((admin) => ({
        user_id: admin.id,
        type: "plan_request",
        title: `New plan request: ${plan.name}`,
        message: `${profile.full_name || profile.email || "A user"} requested ${plan.name} (${priceText}). JobiVerse action: ${checklist.summary} Deliverables: ${checklist.deliverables.join(" | ")}`,
        href: "/admin/memberships",
        reference_id: subscription.id,
      }))
    );
  }

  revalidatePath("/plans");
  revalidatePath("/admin/memberships");
  redirect("/plans?success=plan_requested");
}

export async function cancelPlan(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("subscriptionId"));
  const { user, supabase } = await requireRole(["candidate", "employer"]);
  const { error } = await supabase
    .from("platform_subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/plans");
  redirect("/plans?success=plan_cancelled");
}

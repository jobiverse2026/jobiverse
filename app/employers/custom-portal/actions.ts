"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminSupabase } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { customPortalIndustrySlugs } from "@/lib/custom-portals/catalog";

const schema = z.object({
  organisationName: z.string().trim().min(2).max(160), contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200), phone: z.string().trim().min(7).max(30),
  industry: z.enum(customPortalIndustrySlugs as [string, ...string[]]), companySize: z.string().trim().max(60),
  website: z.string().trim().max(240), selectedModules: z.array(z.string().trim().min(2).max(120)).max(20),
  customModules: z.string().trim().max(2000), requirements: z.string().trim().min(20).max(5000),
  expectedUsers: z.string().trim().max(80), integrations: z.string().trim().max(1000), timeline: z.string().trim().max(80),
  budgetRange: z.string().trim().max(80), callbackRequested: z.boolean(), websiteGuard: z.string().max(0),
}).superRefine((value,ctx)=>{if(value.selectedModules.length===0&&!value.customModules.trim())ctx.addIssue({code:"custom",path:["selectedModules"],message:"Add at least one module."})});

export type PortalRequestState = { success: boolean; message: string; reference?: string };
export async function submitCustomPortalRequest(input: unknown): Promise<PortalRequestState> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Please complete the required details and add at least one module." };
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const reference = `JCP-${Date.now().toString(36).toUpperCase()}`;
  const value = parsed.data;
  const { data: created, error } = await adminSupabase.from("custom_portal_requests").insert({
    reference, requester_user_id: user?.id ?? null, organisation_name: value.organisationName, contact_name: value.contactName,
    email: value.email, phone: value.phone, industry: value.industry, company_size: value.companySize || null,
    website: value.website || null, selected_modules: value.selectedModules, custom_modules: value.customModules || null,
    requirements: value.requirements, expected_users: value.expectedUsers || null, integrations: value.integrations || null,
    timeline: value.timeline || null, budget_range: value.budgetRange || null, callback_requested: value.callbackRequested,
  }).select("id").single();
  if (error || !created) return { success: false, message: "We could not save your request right now. Please try again." };
  const createdRequest = created as { id: string };
  const { data: admins } = await adminSupabase.from("users").select("id").eq("role", "admin").eq("is_active", true);
  if (admins?.length) await adminSupabase.from("notifications").insert(admins.map(admin => ({ user_id: admin.id, type: "custom_portal_request", title: "New custom portal brief", message: `${value.organisationName} submitted a custom operations portal request.`, href: "/admin/custom-portals", reference_id: createdRequest.id })));
  if (user) await adminSupabase.from("notifications").insert({ user_id: user.id, type: "custom_portal_confirmation", title: "Custom portal brief received", message: `Your request ${reference} is recorded. Discovery and project updates will appear in your portal workspace.`, href: "/employers/custom-portal/requests", reference_id: createdRequest.id });
  revalidatePath("/admin/custom-portals");
  return { success: true, message: "Your portal brief is with JobiVerse. We’ll contact you for discovery and scope confirmation.", reference };
}

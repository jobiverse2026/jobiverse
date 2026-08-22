"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";
const statuses=["new","contacted","discovery_scheduled","scoping","proposal_sent","accepted","in_development","delivered","closed"] as const;
export async function updateCustomPortalRequest(formData:FormData){const id=z.string().uuid().parse(formData.get("id"));const status=z.enum(statuses).parse(formData.get("status"));const adminNotes=z.string().trim().max(5000).parse(formData.get("adminNotes")??"");const followUp=z.string().trim().max(40).parse(formData.get("followUp")??"");const{supabase,user}=await requireRole(["admin"]);const{error}=await supabase.from("custom_portal_requests").update({status,admin_notes:adminNotes||null,follow_up_at:followUp?new Date(followUp).toISOString():null,assigned_to:user.id,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw new Error(error.message);revalidatePath("/admin/custom-portals")}

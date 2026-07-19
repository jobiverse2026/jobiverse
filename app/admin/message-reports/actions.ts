"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

export async function moderateMessageReport(formData:FormData){const id=z.string().uuid().parse(formData.get("reportId"));const status=z.enum(["reviewing","resolved","rejected"]).parse(formData.get("status"));const note=z.string().trim().min(5).max(1000).parse(formData.get("adminNote"));const{supabase,user}=await requireRole(["admin"]);const{error}=await supabase.from("marketplace_message_reports").update({status,admin_note:note,resolved_by:user.id,resolved_at:["resolved","rejected"].includes(status)?new Date().toISOString():null}).eq("id",id);if(error)throw new Error(error.message);revalidatePath("/admin/message-reports");}

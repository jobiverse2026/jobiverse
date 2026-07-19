"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

export async function updateConsultation(formData:FormData){const{profile}=await requireRole(["admin"]);const id=z.string().uuid().parse(formData.get("bookingId"));const status=z.enum(["requested","confirmed","completed","cancelled","no_show"]).parse(formData.get("status"));const link=z.string().trim().max(500).parse(String(formData.get("meetingLink")??""));const note=z.string().trim().max(1000).parse(String(formData.get("adminNote")??""));if(status==="confirmed"&&!link)throw new Error("Add the meeting link before confirming.");const normalized=link&&!/^https?:\/\//i.test(link)?`https://${link}`:link;const{data:booking,error:readError}=await adminSupabase.from("consultation_bookings").select("id,user_id").eq("id",id).single();if(readError||!booking)throw new Error(readError?.message??"Booking not found.");const{error}=await adminSupabase.from("consultation_bookings").update({status,meeting_link:normalized||null,admin_note:note||null}).eq("id",id);if(error)throw new Error(error.message);await adminSupabase.from("notifications").insert({user_id:booking.user_id,type:"consultation_update",title:`Consultation ${status.replaceAll("_"," ")}`,message:`${profile.full_name||"JobiVerse"} updated your consultation to ${status.replaceAll("_"," ")}.`,href:"/consultations/my",reference_id:id});revalidatePath("/admin/consultations");revalidatePath("/consultations/my")}

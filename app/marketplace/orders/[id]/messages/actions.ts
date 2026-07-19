"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function context(orderId:string){const supabase=await createServerSupabaseClient();const{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please log in.");const{data:order}=await supabase.from("marketplace_orders").select("id,customer_id,provider_id,status").eq("id",orderId).maybeSingle();if(!order||(order.customer_id!==user.id&&order.provider_id!==user.id))throw new Error("Order access denied.");return{supabase,user,order};}

export async function sendEnhancedMessage(formData:FormData){
  const orderId=z.string().uuid().parse(formData.get("orderId"));const rawMessage=String(formData.get("message")??"").trim();const file=formData.get("attachment");if(!rawMessage&&!(file instanceof File&&file.size>0))throw new Error("Write a message or attach a file.");if(rawMessage.length>2000)throw new Error("Message must be under 2000 characters.");const{supabase,user,order}=await context(orderId);if(["cancelled","refunded"].includes(order.status))throw new Error("Messaging is closed for this order.");let attachmentUrl:string|null=null;let attachmentName:string|null=null;
  if(file instanceof File&&file.size>0){if(file.size>10*1024*1024)throw new Error("Attachment must be under 10 MB.");const ext=file.name.split(".").pop()?.toLowerCase();if(!ext||!["pdf","docx","zip","png","jpg","jpeg","txt"].includes(ext))throw new Error("Upload PDF, DOCX, ZIP, PNG, JPG or TXT.");attachmentName=file.name;attachmentUrl=`${user.id}/${orderId}/${randomUUID()}.${ext}`;const{error}=await supabase.storage.from("marketplace-messages").upload(attachmentUrl,file);if(error)throw new Error(error.message);}
  const message=attachmentName?`${rawMessage?`${rawMessage}\n\n`:""}Attachment: ${attachmentName}`:rawMessage;const{error}=await supabase.from("marketplace_order_messages").insert({order_id:orderId,sender_id:user.id,message,attachment_url:attachmentUrl,attachment_name:attachmentName});if(error)throw new Error(error.message);revalidatePath(`/marketplace/orders/${orderId}/messages`);
}

export async function reportMessage(formData:FormData){const orderId=z.string().uuid().parse(formData.get("orderId"));const messageId=z.string().uuid().parse(formData.get("messageId"));const reason=z.string().trim().min(5).max(1000).parse(formData.get("reason"));const{supabase,user}=await context(orderId);const{error}=await supabase.from("marketplace_message_reports").insert({message_id:messageId,order_id:orderId,reporter_id:user.id,reason});if(error)throw new Error(error.code==="23505"?"You already reported this message.":error.message);revalidatePath(`/marketplace/orders/${orderId}/messages`);}

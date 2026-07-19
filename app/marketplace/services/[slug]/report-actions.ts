"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export type ReportServiceState={error?:string;success?:string};
const schema=z.object({serviceId:z.string().uuid(),reason:z.enum(["misleading","duplicate","prohibited","copyright","pricing","other"]),details:z.string().trim().min(10,"Add at least 10 characters explaining the concern.").max(1000)});

export async function reportMarketplaceService(_state:ReportServiceState,formData:FormData):Promise<ReportServiceState>{
  const parsed=schema.safeParse({serviceId:formData.get("serviceId"),reason:formData.get("reason"),details:formData.get("details")});
  if(!parsed.success)return{error:parsed.error.issues[0]?.message??"Check the report details."};
  const supabase=await createServerSupabaseClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return{error:"Please log in before reporting a service."};
  const{data:service}=await supabase.from("marketplace_services").select("id,provider_id,status").eq("id",parsed.data.serviceId).maybeSingle();
  if(!service)return{error:"This service is no longer available."};if(service.provider_id===user.id)return{error:"You cannot report your own service."};
  const{error}=await supabase.from("marketplace_service_reports").insert({service_id:service.id,reporter_id:user.id,reason:parsed.data.reason,details:parsed.data.details});
  if(error)return{error:error.code==="23505"?"You have already reported this service. JobiVerse is reviewing it.":error.message};
  const[{data:admins},{data:reporter}]=await Promise.all([supabase.from("users").select("id").eq("role","admin"),supabase.from("users").select("full_name,email").eq("id",user.id).maybeSingle()]);
  if(admins?.length)await adminSupabase.from("notifications").insert(admins.map(admin=>({user_id:admin.id,type:"service_report_new",title:"New marketplace service report",message:`${reporter?.full_name||reporter?.email||"A platform member"} reported a service for ${parsed.data.reason.replaceAll("_"," ")}.`,href:"/admin/marketplace",reference_id:service.id})));
  revalidatePath("/admin/marketplace");return{success:"Report received. JobiVerse will review the listing and take appropriate action."};
}



"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function savePrivacyPreferences(formData:FormData){const supabase=await createServerSupabaseClient();const{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please log in.");const{error}=await supabase.from("user_privacy_preferences").upsert({user_id:user.id,profile_discovery:formData.get("profileDiscovery")==="on",career_recommendations:formData.get("careerRecommendations")==="on",marketing_research:formData.get("marketingResearch")==="on",consent_version:"2026-07",updated_at:new Date().toISOString()});if(error)throw new Error(error.message);revalidatePath("/account/privacy");redirect("/account/privacy?success=privacy_saved")}

export async function submitPrivacyRequest(formData:FormData){const supabase=await createServerSupabaseClient();const{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please log in.");const requestType=z.enum(["access","correction","deletion","consent_withdrawal","grievance"]).parse(formData.get("requestType"));const details=z.string().trim().min(10).max(2000).parse(formData.get("details"));const{data:request,error}=await supabase.from("privacy_requests").insert({user_id:user.id,request_type:requestType,details}).select("id").single();if(error)throw new Error(error.code==="23505"?"An active request of this type already exists.":error.message);const[{data:admins},{data:person}]=await Promise.all([supabase.from("users").select("id").eq("role","admin"),supabase.from("users").select("full_name,email").eq("id",user.id).maybeSingle()]);if(admins?.length)await adminSupabase.from("notifications").insert(admins.map(admin=>({user_id:admin.id,type:"privacy_request",title:"New privacy request",message:`${person?.full_name||person?.email||"A member"} submitted a ${requestType.replaceAll("_"," ")} request.`,href:"/admin/privacy-requests",reference_id:request.id})));revalidatePath("/account/privacy");revalidatePath("/admin/privacy-requests");redirect("/account/privacy?success=privacy_requested")}

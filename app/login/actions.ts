"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type LoginRole="candidate"|"employer"|"recruiter"|"admin"|"creator";
const roleRedirect:Record<LoginRole,string>={candidate:"/candidates/dashboard",employer:"/employers/dashboard",recruiter:"/recruiter",admin:"/admin",creator:"/earn-with-jobiverse/dashboard"};

function safeDestination(next:string|undefined,fallback:string){if(!next?.startsWith("/")||next.startsWith("//")||next.includes("\\")||/^\/(login|signup|auth)(\/|\?|$)/i.test(next))return fallback;return next}

export async function loginWithRoleAction(email:string,password:string,expectedRole:LoginRole,next?:string){
  const input=z.object({email:z.string().trim().email(),password:z.string().min(1),expectedRole:z.enum(["candidate","employer","recruiter","admin","creator"])}).safeParse({email,password,expectedRole});if(!input.success)return{error:"Enter a valid email address and password."};
  const supabase=await createServerSupabaseClient();const{data,error}=await supabase.auth.signInWithPassword({email:input.data.email.toLowerCase(),password:input.data.password});if(error)return{error:error.message.toLowerCase().includes("invalid login credentials")?"The email or password you entered is incorrect. Please try again or reset your password.":error.message};
  const{data:profile,error:profileError}=await supabase.from("users").select("role,is_active").eq("id",data.user.id).maybeSingle();if(profileError||!profile?.role){await supabase.auth.signOut();return{error:"User profile not found."}}if(profile.is_active===false){await supabase.auth.signOut();return{error:"This account is currently inactive. Contact JobiVerse support."}}
  const creatorAccess=expectedRole==="creator"&&["candidate","creator"].includes(profile.role);if(!creatorAccess&&profile.role!==expectedRole){await supabase.auth.signOut();return{error:`You are not authorized for this portal. This account belongs to the ${profile.role} portal.`}}
  return{redirect:safeDestination(next,roleRedirect[expectedRole])};
}

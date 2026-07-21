"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { claimPendingEmployerTeamInvite } from "@/lib/employer-team/invitations";
import { getEmployerCompanyAccess } from "@/lib/employer-team/access";
import { adminSupabase } from "@/lib/supabase/admin";
import { confirmExistingSignupEmail } from "@/app/signup/actions";

type LoginRole="candidate"|"employer"|"recruiter"|"admin"|"creator";
type AutoConfirmLoginRole=Exclude<LoginRole,"admin">;
const roleRedirect:Record<LoginRole,string>={candidate:"/candidates/dashboard",employer:"/employers/dashboard",recruiter:"/recruiter",admin:"/admin",creator:"/earn-with-jobiverse/dashboard"};

function safeDestination(next:string|undefined,fallback:string){if(!next?.startsWith("/")||next.startsWith("//")||next.includes("\\")||/^\/(login|signup|auth)(\/|\?|$)/i.test(next))return fallback;return next}

export async function loginWithRoleAction(email:string,password:string,expectedRole:LoginRole,next?:string){
  const input=z.object({email:z.string().trim().email(),password:z.string().min(1),expectedRole:z.enum(["candidate","employer","recruiter","admin","creator"])}).safeParse({email,password,expectedRole});if(!input.success)return{error:"Enter a valid email address and password."};
  const normalizedEmail=input.data.email.toLowerCase();const supabase=await createServerSupabaseClient();let{data,error}=await supabase.auth.signInWithPassword({email:normalizedEmail,password:input.data.password});if(error&&error.message.toLowerCase().includes("email not confirmed")&&expectedRole!=="admin"){const confirmation=await confirmExistingSignupEmail(normalizedEmail,expectedRole as AutoConfirmLoginRole);if(confirmation.error)return{error:confirmation.error};const retry=await supabase.auth.signInWithPassword({email:normalizedEmail,password:input.data.password});data=retry.data;error=retry.error;}if(error)return{error:error.message.toLowerCase().includes("invalid login credentials")?"The email or password you entered is incorrect. Please try again or reset your password.":error.message.toLowerCase().includes("email not confirmed")?"This email is not confirmed yet. Please contact JobiVerse support to activate this account.":error.message};
  const user=data.user;if(!user)return{error:"Unable to open your account after confirmation. Please try logging in again."};
  if((expectedRole==="employer"||expectedRole==="recruiter")&&user.email){
    try{await claimPendingEmployerTeamInvite({userId:user.id,email:user.email,expectedRole});}
    catch(error){await supabase.auth.signOut();return{error:error instanceof Error?error.message:"Unable to activate invited access. Please contact JobiVerse support."};}
  }
  const{data:profile,error:profileError}=await supabase.from("users").select("role,is_active").eq("id",user.id).maybeSingle();if(profileError||!profile?.role){await supabase.auth.signOut();return{error:"User profile not found."}}if(profile.is_active===false){await supabase.auth.signOut();return{error:"This account is currently inactive. Contact JobiVerse support."}}
  const creatorAccess=expectedRole==="creator"&&["candidate","creator"].includes(profile.role);if(!creatorAccess&&profile.role!==expectedRole){await supabase.auth.signOut();return{error:`You are not authorized for this portal. This account belongs to the ${profile.role} portal.`}}
  if(expectedRole==="employer"){
    try{await getEmployerCompanyAccess(user.id);}
    catch{await supabase.auth.signOut();return{error:"Employer login is available only after JobiVerse assigns company seats. Please contact JobiVerse to activate employer access."};}
  }
  if(expectedRole==="recruiter"){
    const{count,error:memberError}=await adminSupabase.from("employer_team_members").select("id",{count:"exact",head:true}).eq("user_id",user.id).eq("role","recruiter").eq("status","active");
    if(memberError||!count){await supabase.auth.signOut();return{error:"Recruiter login is available only after your employer adds this email to recruiter seats. Please contact your employer or JobiVerse."};}
  }
  return{redirect:safeDestination(next,roleRedirect[expectedRole])};
}

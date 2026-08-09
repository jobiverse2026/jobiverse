"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";
import { notifyUser } from "@/lib/notifications/notify-user";

export async function withdrawApplication(formData: FormData) {
  const applicationId=z.string().uuid().parse(formData.get("applicationId"));
  const reason=z.enum(["accepted_other_offer","role_mismatch","location","compensation","timing","personal","other"]).parse(formData.get("reason"));
  const note=z.string().trim().max(500).parse(formData.get("note")??"");
  const{supabase,user}=await requireRole(["candidate"]);
  const{data:application}=await supabase.from("candidate_applications").select("id,status,requirements(job_title,employer_id)").eq("id",applicationId).eq("candidate_user_id",user.id).maybeSingle();
  if(!application)throw new Error("Application not found.");
  if(/withdraw|reject|hired|joined|accept/i.test(application.status))throw new Error("This application can no longer be withdrawn.");
  const{error}=await supabase.from("candidate_applications").update({status:"Withdrawn",withdrawal_reason:reason,withdrawal_note:note||null,withdrawn_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",applicationId).eq("candidate_user_id",user.id);
  if(error)throw new Error(error.message);
  const requirement=Array.isArray(application.requirements)?application.requirements[0]:application.requirements;
  if(requirement?.employer_id)await notifyUser({userId:requirement.employer_id,type:"application_withdrawn",title:"Application withdrawn",body:`A candidate withdrew from ${requirement.job_title||"a role"}.`,href:`/hiring/applications/${applicationId}`,referenceId:applicationId,tag:`application-${applicationId}`});
  revalidatePath("/candidates/applications");
}

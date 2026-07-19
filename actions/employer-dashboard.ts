"use server";
import { requireRole } from "@/lib/auth/authorization";

const clientStatuses=["Client Submitted","Interview","Selected","Offered","Joined","Rejected","Withdrawn"];
export async function getEmployerDashboardData(){
  const{supabase,user}=await requireRole(["employer"]);
  const{data:ownedRequirements,error}=await supabase.from("requirements").select("id,job_title,status,assigned_recruiter,created_at,candidates(count)").eq("employer_id",user.id).order("created_at",{ascending:false});
  if(error)throw new Error(error.message);
  const allRequirements=ownedRequirements??[];const requirementIds=allRequirements.map(item=>item.id);const activeRequirements=allRequirements.filter(item=>!["closed","cancelled"].includes(normalize(item.status))).length;
  if(!requirementIds.length)return{stats:{activeRequirements:0,candidates:0,interviews:0,positionsClosed:0,activeOffers:0},recentRequirements:[],recentCandidates:[],pipeline:clientStatuses.map(stage=>({stage,value:0}))};
  const[candidates,interviews,placements,activeOffers,recentCandidates,pipelineCandidates]=await Promise.all([
    supabase.from("candidates").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",clientStatuses),
    supabase.from("interviews").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["scheduled","rescheduled"]),
    supabase.from("placements").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["joined","completed"]),
    supabase.from("placements").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["offered","accepted"]),
    supabase.from("candidates").select("id,full_name,total_experience,status,created_at,requirements(job_title)").in("requirement_id",requirementIds).in("status",clientStatuses).order("created_at",{ascending:false}).limit(5),
    supabase.from("candidates").select("status").in("requirement_id",requirementIds).in("status",clientStatuses),
  ]);
  return{stats:{activeRequirements,candidates:candidates.count??0,interviews:interviews.count??0,positionsClosed:placements.count??0,activeOffers:activeOffers.count??0},recentRequirements:allRequirements.slice(0,5),recentCandidates:recentCandidates.data??[],pipeline:clientStatuses.map(stage=>({stage,value:(pipelineCandidates.data??[]).filter(candidate=>candidate.status===stage).length}))};
}
function normalize(value:string|null){return String(value??"").trim().toLowerCase().replaceAll("_"," ")}

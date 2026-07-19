"use server";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const clientStatuses=["Client Submitted","Interview","Selected","Offered","Joined","Rejected","Withdrawn"];
export async function getEmployerDashboardData(){
  const{user}=await requireRole(["employer"]);
  const empty={stats:{activeRequirements:0,candidates:0,interviews:0,positionsClosed:0,activeOffers:0},recentRequirements:[],recentCandidates:[],pipeline:clientStatuses.map(stage=>({stage,value:0}))};
  const{data:ownedRequirements,error}=await adminSupabase.from("requirements").select("id,job_title,status,assigned_recruiter,created_at,candidates(count)").eq("employer_id",user.id).order("created_at",{ascending:false});
  if(error)return empty;
  const allRequirements=ownedRequirements??[];const requirementIds=allRequirements.map(item=>item.id);const activeRequirements=allRequirements.filter(item=>!["closed","cancelled"].includes(normalize(item.status))).length;
  if(!requirementIds.length)return empty;
  const[candidates,interviews,placements,activeOffers,recentCandidates,pipelineCandidates]=await Promise.all([
    adminSupabase.from("candidates").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",clientStatuses),
    adminSupabase.from("interviews").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["scheduled","rescheduled"]),
    adminSupabase.from("placements").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["joined","completed"]),
    adminSupabase.from("placements").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["offered","accepted"]),
    adminSupabase.from("candidates").select("id,full_name,total_experience,status,created_at,requirements(job_title)").in("requirement_id",requirementIds).in("status",clientStatuses).order("created_at",{ascending:false}).limit(5),
    adminSupabase.from("candidates").select("status").in("requirement_id",requirementIds).in("status",clientStatuses),
  ]);
  return{stats:{activeRequirements,candidates:candidates.count??0,interviews:interviews.count??0,positionsClosed:placements.count??0,activeOffers:activeOffers.count??0},recentRequirements:allRequirements.slice(0,5),recentCandidates:recentCandidates.data??[],pipeline:clientStatuses.map(stage=>({stage,value:(pipelineCandidates.data??[]).filter(candidate=>candidate.status===stage).length}))};
}
function normalize(value:string|null){return String(value??"").trim().toLowerCase().replaceAll("_"," ")}

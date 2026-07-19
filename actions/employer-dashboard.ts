"use server";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";

const clientStatuses=["Client Submitted","Interview","Selected","Offered","Joined","Rejected","Withdrawn"];
export async function getEmployerDashboardData(){
  const{user}=await requireRole(["employer"]);
  const empty={stats:{activeRequirements:0,candidates:0,interviews:0,positionsClosed:0,activeOffers:0,publishedJobs:0,jobiverseAssigned:0,externalApplicants:0,seatLimit:0,seatsUsed:0,seatsLeft:0},recentRequirements:[],recentCandidates:[],pipeline:clientStatuses.map(stage=>({stage,value:0}))};
  const [{data:company},{data:ownedRequirements,error}]=await Promise.all([
    adminSupabase.from("companies").select("id,recruiter_seat_limit").eq("owner_id",user.id).maybeSingle(),
    adminSupabase.from("requirements").select("id,job_title,status,assigned_recruiter,created_at,is_public,hiring_team_requested,candidates(count)").eq("employer_id",user.id).order("created_at",{ascending:false})
  ]);
  if(error)return empty;
  const allRequirements=ownedRequirements??[];const requirementIds=allRequirements.map(item=>item.id);const activeRequirements=allRequirements.filter(item=>!["closed","cancelled"].includes(normalize(item.status))).length;
  const seatLimit=company?.recruiter_seat_limit??0;
  const [members,invites]=company ? await Promise.all([
    adminSupabase.from("employer_team_members").select("id",{count:"exact",head:true}).eq("company_id",company.id).eq("status","active"),
    adminSupabase.from("employer_team_invitations").select("id",{count:"exact",head:true}).eq("company_id",company.id).eq("status","pending").gt("expires_at",new Date().toISOString()),
  ]) : [{count:0},{count:0}];
  const seatsUsed=(members.count??0)+(invites.count??0);
  const seatStats={seatLimit,seatsUsed,seatsLeft:Math.max(0,seatLimit-seatsUsed)};
  if(!requirementIds.length)return {...empty,stats:{...empty.stats,...seatStats}};
  const[candidates,interviews,placements,activeOffers,recentCandidates,pipelineCandidates,externalApplicants]=await Promise.all([
    adminSupabase.from("candidates").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",clientStatuses),
    adminSupabase.from("interviews").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["scheduled","rescheduled"]),
    adminSupabase.from("placements").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["joined","completed"]),
    adminSupabase.from("placements").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["offered","accepted"]),
    adminSupabase.from("candidates").select("id,full_name,total_experience,status,created_at,requirements(job_title)").in("requirement_id",requirementIds).in("status",clientStatuses).order("created_at",{ascending:false}).limit(5),
    adminSupabase.from("candidates").select("status").in("requirement_id",requirementIds).in("status",clientStatuses),
    adminSupabase.from("candidate_applications").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds),
  ]);
  return{stats:{activeRequirements,candidates:candidates.count??0,interviews:interviews.count??0,positionsClosed:placements.count??0,activeOffers:activeOffers.count??0,publishedJobs:allRequirements.filter(item=>item.is_public).length,jobiverseAssigned:allRequirements.filter(item=>item.hiring_team_requested).length,externalApplicants:externalApplicants.count??0,...seatStats},recentRequirements:allRequirements.slice(0,5),recentCandidates:recentCandidates.data??[],pipeline:clientStatuses.map(stage=>({stage,value:(pipelineCandidates.data??[]).filter(candidate=>candidate.status===stage).length}))};
}
function normalize(value:string|null){return String(value??"").trim().toLowerCase().replaceAll("_"," ")}

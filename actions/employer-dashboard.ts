"use server";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { getEmployerCompanyAccess, scopeEmployerRequirementQuery } from "@/lib/employer-team/access";

const clientStatuses=["Client Submitted","Interview","Selected","Offered","Joined","Rejected","Withdrawn"];
export async function getEmployerDashboardData(){
  const{user}=await requireRole(["employer"]);
  const empty={stats:{activeRequirements:0,candidates:0,interviews:0,positionsClosed:0,activeOffers:0,publishedJobs:0,jobiverseAssigned:0,externalApplicants:0,seatLimit:0,seatsUsed:0,seatsLeft:0,employerSeatLimit:0,employerSeatsUsed:0,employerSeatsLeft:0,recruiterSeatLimit:0,recruiterSeatsUsed:0,recruiterSeatsLeft:0},recentRequirements:[],recentCandidates:[],pipeline:clientStatuses.map(stage=>({stage,value:0}))};
  let access;try{access=await getEmployerCompanyAccess(user.id)}catch{return empty}
  const company=access.company;
  const requirementQuery=scopeEmployerRequirementQuery(adminSupabase.from("requirements").select("id,job_title,status,assigned_recruiter,created_at,is_public,hiring_team_requested,candidates(count)").order("created_at",{ascending:false}),access,user.id);
  const {data:ownedRequirements,error}=await requirementQuery;
  if(error)return empty;
  const allRequirements=(ownedRequirements??[]) as any[];const requirementIds=allRequirements.map((item:any)=>item.id);const activeRequirements=allRequirements.filter((item:any)=>!["closed","cancelled"].includes(normalize(item.status))).length;
  const employerSeatLimit=access.isMasterEmployer?company.employer_seat_limit:0;
  const recruiterSeatLimit=access.isMasterEmployer?company.recruiter_seat_limit:(company.recruiter_seat_allowance??0);
  const seatManagerId=access.isMasterEmployer?company.owner_id:user.id;
  const [employerMembers,employerInvites,recruiterMembers,recruiterInvites]=company ? await Promise.all([
    access.isMasterEmployer?adminSupabase.from("employer_team_members").select("id",{count:"exact",head:true}).eq("company_id",company.id).eq("role","employer").eq("status","active"):Promise.resolve({count:0} as any),
    access.isMasterEmployer?adminSupabase.from("employer_team_invitations").select("id",{count:"exact",head:true}).eq("company_id",company.id).eq("role","employer").eq("status","pending").gt("expires_at",new Date().toISOString()):Promise.resolve({count:0} as any),
    adminSupabase.from("employer_team_members").select("id",{count:"exact",head:true}).eq("company_id",company.id).eq("role","recruiter").eq("employer_id",seatManagerId).eq("status","active"),
    adminSupabase.from("employer_team_invitations").select("id",{count:"exact",head:true}).eq("company_id",company.id).eq("role","recruiter").eq("employer_id",seatManagerId).eq("status","pending").gt("expires_at",new Date().toISOString()),
  ]) : [{count:0},{count:0},{count:0},{count:0}];
  const employerSeatsUsed=(employerMembers.count??0)+(employerInvites.count??0);
  const recruiterSeatsUsed=(recruiterMembers.count??0)+(recruiterInvites.count??0);
  const seatLimit=employerSeatLimit+recruiterSeatLimit;
  const seatsUsed=employerSeatsUsed+recruiterSeatsUsed;
  const seatStats={seatLimit,seatsUsed,seatsLeft:Math.max(0,seatLimit-seatsUsed),employerSeatLimit,employerSeatsUsed,employerSeatsLeft:Math.max(0,employerSeatLimit-employerSeatsUsed),recruiterSeatLimit,recruiterSeatsUsed,recruiterSeatsLeft:Math.max(0,recruiterSeatLimit-recruiterSeatsUsed)};
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
  return{stats:{activeRequirements,candidates:candidates.count??0,interviews:interviews.count??0,positionsClosed:placements.count??0,activeOffers:activeOffers.count??0,publishedJobs:allRequirements.filter((item:any)=>item.is_public).length,jobiverseAssigned:allRequirements.filter((item:any)=>item.hiring_team_requested).length,externalApplicants:externalApplicants.count??0,...seatStats},recentRequirements:allRequirements.slice(0,5),recentCandidates:recentCandidates.data??[],pipeline:clientStatuses.map(stage=>({stage,value:((pipelineCandidates.data??[]) as any[]).filter((candidate:any)=>candidate.status===stage).length}))};
}
function normalize(value:string|null){return String(value??"").trim().toLowerCase().replaceAll("_"," ")}

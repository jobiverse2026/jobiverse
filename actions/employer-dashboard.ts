"use server";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { getEmployerCompanyAccess, scopeEmployerRequirementQuery } from "@/lib/employer-team/access";
import { hiringHealthScore } from "@/lib/candidate/intelligence";

const clientStatuses=["Submitted","Client Submitted","Interview","Selected","Offered","Joined","Rejected","Withdrawn"];
export async function getEmployerDashboardData(){
  const{user}=await requireRole(["employer"]);
  const empty={stats:{activeRequirements:0,candidates:0,interviews:0,positionsClosed:0,activeOffers:0,publishedJobs:0,jobiverseAssigned:0,externalApplicants:0,hiringHealthScore:0,seatLimit:0,seatsUsed:0,seatsLeft:0,employerSeatLimit:0,employerSeatsUsed:0,employerSeatsLeft:0,recruiterSeatLimit:0,recruiterSeatsUsed:0,recruiterSeatsLeft:0},entitlements:{coreSubscriptionActive:false,corePlanName:null as string|null,talentSearchActive:false,teamSeatsActive:false},recentRequirements:[],recentCandidates:[],pipeline:clientStatuses.map(stage=>({stage,value:0}))};
  let access;try{access=await getEmployerCompanyAccess(user.id)}catch{return empty}
  const company=access.company;
  const requirementQuery=scopeEmployerRequirementQuery(adminSupabase.from("requirements").select("id,job_title,status,assigned_recruiter,created_at,is_public,hiring_team_requested").order("created_at",{ascending:false}),access,user.id);
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
  const {data:subscriptionRows}=await adminSupabase.from("platform_subscriptions").select("status,platform_plans(slug,name)").eq("user_id",company.owner_id).eq("status","active");
  const activePlans=(subscriptionRows??[]).map((row:any)=>Array.isArray(row.platform_plans)?row.platform_plans[0]:row.platform_plans).filter(Boolean);
  const corePlan=activePlans.find((plan:any)=>["employer-starter","employer-growth","employer-enterprise"].includes(plan.slug));
  const entitlements={coreSubscriptionActive:Boolean(corePlan),corePlanName:corePlan?.name??null,talentSearchActive:activePlans.some((plan:any)=>["employer-talent-search","employer-enterprise"].includes(plan.slug)),teamSeatsActive:seatLimit>0};
  if(!requirementIds.length)return {...empty,stats:{...empty.stats,...seatStats},entitlements};
  const[candidateRows,interviews,placements,activeOffers,externalApplicants]=await Promise.all([
    adminSupabase.from("candidates").select("id,full_name,total_experience,status,created_at,requirement_id,recruiter_name,recruiter_email,source,requirements(job_title)").in("requirement_id",requirementIds).order("created_at",{ascending:false}),
    adminSupabase.from("interviews").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["scheduled","rescheduled"]),
    adminSupabase.from("placements").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["joined","completed"]),
    adminSupabase.from("placements").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds).in("status",["offered","accepted"]),
    adminSupabase.from("candidate_applications").select("id",{count:"exact",head:true}).in("requirement_id",requirementIds),
  ]);
  const candidates=(candidateRows.data??[]) as any[];
  const requirementsWithCandidateStatus=allRequirements.map((requirement:any)=>{
    const related=candidates.filter((candidate:any)=>candidate.requirement_id===requirement.id);
    const statusCounts=clientStatuses.map(stage=>({stage,count:related.filter((candidate:any)=>normalize(candidate.status)===normalize(stage)).length})).filter(item=>item.count>0);
    return{...requirement,candidate_count:related.length,latest_candidate_status:related[0]?.status??null,candidate_status_counts:statusCounts};
  });
  const healthScore=hiringHealthScore({activeRequirements,candidates:candidates.length,interviews:interviews.count??0,positionsClosed:placements.count??0,externalApplicants:externalApplicants.count??0});
  return{stats:{activeRequirements,candidates:candidates.length,interviews:interviews.count??0,positionsClosed:placements.count??0,activeOffers:activeOffers.count??0,publishedJobs:allRequirements.filter((item:any)=>item.is_public).length,jobiverseAssigned:allRequirements.filter((item:any)=>item.hiring_team_requested).length,externalApplicants:externalApplicants.count??0,hiringHealthScore:healthScore,...seatStats},entitlements,recentRequirements:requirementsWithCandidateStatus.slice(0,5),recentCandidates:candidates.slice(0,5),pipeline:clientStatuses.map(stage=>({stage,value:candidates.filter((candidate:any)=>normalize(candidate.status)===normalize(stage)).length}))};
}
function normalize(value:string|null){return String(value??"").trim().toLowerCase().replaceAll("_"," ")}

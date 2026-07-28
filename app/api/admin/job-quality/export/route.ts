import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { evaluateJobQuality } from "@/lib/jobs/quality";

export async function GET() {
  await requireRole(["admin"]);
  const { data, error } = await adminSupabase.from("requirements").select("id,job_title,job_description,location,primary_skills,employment_type,work_mode,experience,status,is_public,published_at,companies(company_name,website,logo_url)").eq("is_public", true).order("published_at", { ascending: false });
  if (error) return NextResponse.json({error:error.message},{status:500});
  const lines = [["Job ID","Company","Role","Location","Status","Quality Score","Grade","Issues"],...(data??[]).map(job=>{const company=job.companies?.[0]??null;const q=evaluateJobQuality({...job,companyName:company?.company_name,companyWebsite:company?.website,companyLogo:company?.logo_url});return[job.id,company?.company_name||"",job.job_title||"",job.location||"",job.status||"",String(q.score),q.grade,q.issues.join("; ")]})].map(row=>row.map(csv).join(",")).join("\r\n");
  return new NextResponse(lines,{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="jobiverse-job-quality-${new Date().toISOString().slice(0,10)}.csv"`}});
}
function csv(value:string){return `"${String(value).replaceAll('"','""')}"`}

import { adminSupabase } from "@/lib/supabase/admin";
import { runLifecycleAutomations } from "@/lib/lifecycle/run";
import { notifyUser } from "@/lib/notifications/notify-user";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date().toISOString();
  const [{ data: expiredRoles, error: roleError }, { data: expiredPromotions, error: promotionError }] = await Promise.all([
    adminSupabase.from("requirements").update({ is_public: false, status: "Closed", updated_at: now }).eq("is_public", true).lte("expires_at", now).select("id,job_title,employer_id"),
    adminSupabase.from("requirements").update({ is_promoted: false, promotion_tier: null, promotion_payment_attempt_id: null }).eq("is_promoted", true).lte("promoted_until", now).select("id"),
  ]);
  if (roleError || promotionError) return Response.json({ error: roleError?.message ?? promotionError?.message }, { status: 500 });
  for (const role of expiredRoles ?? []) {
    await notifyUser({userId:role.employer_id,type:"job_expired",title:"Job listing auto-closed",body:`${role.job_title} reached its application deadline and was closed automatically.`,href:`/employers/requirements/${role.id}`,referenceId:role.id,tag:`job-${role.id}`});
    const [{data:saved},{data:applications}]=await Promise.all([adminSupabase.from("candidate_saved_jobs").select("candidate_user_id").eq("requirement_id",role.id),adminSupabase.from("candidate_applications").select("candidate_user_id").eq("requirement_id",role.id)]);
    const recipients=[...new Set([...(saved??[]).map(item=>item.candidate_user_id),...(applications??[]).map(item=>item.candidate_user_id)])];
    await Promise.all(recipients.map(userId=>notifyUser({userId,type:"job_expired",title:"Job listing closed",body:`${role.job_title} is no longer accepting applications.`,href:"/candidates/applications",referenceId:role.id,tag:`job-${role.id}`})));
  }
  const lifecycle = await runLifecycleAutomations();
  return Response.json({ ok: true, expiredRoles: expiredRoles?.length ?? 0, expiredPromotions: expiredPromotions?.length ?? 0, lifecycle, ranAt: now });
}
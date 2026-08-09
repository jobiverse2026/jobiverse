import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notifications/notify-user";

function authorized(request: Request) {
  const secret = process.env.EMAIL_WORKER_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? request.headers.get("x-worker-secret");
  return Boolean(secret && supplied === secret);
}

function tokens(value?: string | null) {
  return (value ?? "").split(/[,;/|]+/).map((item) => item.trim().toLowerCase()).filter((item) => item.length > 1);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = Date.now();
  const { data: preferences, error } = await adminSupabase.from("candidate_job_alert_preferences").select("user_id,role_titles,locations,work_modes,sectors,job_types,frequency,last_digest_sent_at").eq("is_active", true).in("frequency", ["daily", "weekly"]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: jobs } = await adminSupabase.from("requirements").select("id,job_title,location,work_mode,employment_type,department,primary_skills,published_at,companies(company_name)").eq("is_public", true).not("status", "in", '("Closed","Cancelled")').gte("published_at", new Date(now - 8 * 86400000).toISOString()).order("published_at", { ascending: false }).limit(500);
  let delivered = 0;
  for (const preference of preferences ?? []) {
    const interval = preference.frequency === "daily" ? 86400000 : 7 * 86400000;
    if (preference.last_digest_sent_at && now - new Date(preference.last_digest_sent_at).getTime() < interval - 3600000) continue;
    const roles = tokens(preference.role_titles); const locations = tokens(preference.locations);
    const matches = (jobs ?? []).filter((job) => {
      const haystack = `${job.job_title} ${job.department ?? ""} ${job.primary_skills ?? ""}`.toLowerCase();
      const roleMatch = !roles.length || roles.some((value) => haystack.includes(value));
      const locationMatch = !locations.length || locations.some((value) => value === "remote" ? String(job.work_mode).toLowerCase().includes("remote") : String(job.location).toLowerCase().includes(value));
      const workMatch = !preference.work_modes?.length || preference.work_modes.some((value: string) => String(job.work_mode).toLowerCase().includes(value.toLowerCase()));
      const typeMatch = !preference.job_types?.length || preference.job_types.some((value: string) => String(job.employment_type).toLowerCase().includes(value.toLowerCase()));
      const sectorMatch = !preference.sectors?.length || preference.sectors.some((value: string) => value.replaceAll("-", " ").split(" ").some((part) => part.length > 2 && haystack.includes(part)));
      return roleMatch && locationMatch && workMatch && typeMatch && sectorMatch;
    }).slice(0, 8);
    if (!matches.length) continue;
    const top = matches.slice(0, 3).map((job) => job.job_title).join(", ");
    await notifyUser({ userId: preference.user_id, type: "job_digest", title: `${matches.length} matching JobiVerse role${matches.length === 1 ? "" : "s"}`, body: `${top}${matches.length > 3 ? ` and ${matches.length - 3} more` : ""}. Open your personalized job feed.`, href: "/candidates/jobs", tag: `job-digest-${preference.frequency}` });
    await adminSupabase.from("candidate_job_alert_preferences").update({ last_digest_sent_at: new Date().toISOString() }).eq("user_id", preference.user_id);
    delivered += 1;
  }
  return NextResponse.json({ ok: true, candidates: preferences?.length ?? 0, digests: delivered });
}

export const POST = GET;

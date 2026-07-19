import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const tables = ["users", "candidate_profiles", "candidate_applications", "candidate_saved_jobs", "candidate_resume_versions", "marketplace_orders", "marketplace_offers", "marketplace_reviews", "consultation_bookings", "buyer_billing_profiles", "notification_preferences", "user_privacy_preferences", "privacy_requests"] as const;
  const entries = await Promise.all(tables.map(async (table) => {
    const key = table === "users" ? "id" : table === "candidate_profiles" ? "user_id" : table === "candidate_applications" ? "candidate_user_id" : table === "candidate_saved_jobs" ? "candidate_user_id" : table === "candidate_resume_versions" ? "user_id" : table === "marketplace_orders" ? "customer_id" : table === "marketplace_offers" ? "customer_id" : table === "marketplace_reviews" ? "reviewer_id" : "user_id";
    const { data, error } = await adminSupabase.from(table).select("*").eq(key, user.id);
    return [table, error ? { unavailable: error.message } : data] as const;
  }));
  const payload = { exported_at: new Date().toISOString(), format_version: "1.0", account_id: user.id, notice: "This export contains primary account records. Payment-provider, security and legally retained audit records may be maintained separately.", data: Object.fromEntries(entries) };
  return new Response(JSON.stringify(payload, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="jobiverse-data-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "private, no-store" } });
}

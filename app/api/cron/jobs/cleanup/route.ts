import { adminSupabase } from "@/lib/supabase/admin";
import { runLifecycleAutomations } from "@/lib/lifecycle/run";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date().toISOString();
  const [{ data: expiredRoles, error: roleError }, { data: expiredPromotions, error: promotionError }] = await Promise.all([
    adminSupabase
      .from("requirements")
      .update({ is_public: false, status: "Closed", updated_at: now })
      .eq("is_public", true)
      .lte("expires_at", now)
      .select("id"),
    adminSupabase
      .from("requirements")
      .update({ is_promoted: false, promotion_tier: null, promotion_payment_attempt_id: null })
      .eq("is_promoted", true)
      .lte("promoted_until", now)
      .select("id"),
  ]);

  if (roleError || promotionError) return Response.json({ error: roleError?.message ?? promotionError?.message }, { status: 500 });
  const lifecycle = await runLifecycleAutomations();
  return Response.json({ ok: true, expiredRoles: expiredRoles?.length ?? 0, expiredPromotions: expiredPromotions?.length ?? 0, lifecycle, ranAt: now });
}

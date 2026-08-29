import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { getLaunchReadiness } from "@/lib/launch-readiness";

export async function GET() {
  try {
    await requireRole(["admin"]);
    const { data, error } = await adminSupabase.rpc("admin_pending_counts");
    if (error) throw error;

    return Response.json(
      { ...(data ?? {}), "/admin/settings": getLaunchReadiness().missing },
      { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=120" } },
    );
  } catch {
    return Response.json({}, { status: 403 });
  }
}

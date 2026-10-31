import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const deep = url.searchParams.get("deep") === "1";

  if (!deep) {
    return NextResponse.json(
      { status: "healthy", service: "jobiverse-worker", timestamp: new Date().toISOString(), response_ms: Date.now() - startedAt },
      { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" } },
    );
  }

  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { error } = await adminSupabase.from("users").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;
    return NextResponse.json(
      { status: "healthy", service: "jobiverse-worker", database: "reachable", timestamp: new Date().toISOString(), response_ms: Date.now() - startedAt },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { status: "unhealthy", service: "jobiverse-worker", database: "unreachable", timestamp: new Date().toISOString(), response_ms: Date.now() - startedAt },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}

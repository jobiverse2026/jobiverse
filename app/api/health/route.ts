import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    const { error } = await adminSupabase.from("users").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;
    return NextResponse.json(
      { status: "healthy", database: "reachable", timestamp: new Date().toISOString(), response_ms: Date.now() - startedAt },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      { status: "unhealthy", database: "unreachable", timestamp: new Date().toISOString(), response_ms: Date.now() - startedAt },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}

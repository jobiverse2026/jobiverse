import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { authenticated: false },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json(
    {
      authenticated: true,
      role: profile?.role ?? null,
      isActive: profile?.is_active !== false,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

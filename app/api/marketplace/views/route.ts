import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { slugs?: unknown };
    const slugs = Array.isArray(body.slugs) ? [...new Set(body.slugs.filter((slug): slug is string => typeof slug === "string" && /^[a-z0-9-]{1,100}$/.test(slug)))].slice(0, 20) : [];
    if (!slugs.length) return NextResponse.json({ recorded: 0 });
    const supabase = await createServerSupabaseClient();
    await Promise.all(slugs.map(serviceSlug => supabase.rpc("increment_marketplace_service_view", { service_slug: serviceSlug })));
    return NextResponse.json({ recorded: slugs.length });
  } catch {
    return NextResponse.json({ recorded: 0 }, { status: 400 });
  }
}

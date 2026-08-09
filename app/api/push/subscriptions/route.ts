import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(4096),
  keys: z.object({ p256dh: z.string().min(20).max(1024), auth: z.string().min(8).max(512) }),
});

async function userContext() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}


export async function GET() {
  const { supabase, user } = await userContext();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("push_subscriptions").select("id,device_name,user_agent,quiet_hours_start,quiet_hours_end,categories,created_at").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ devices: data ?? [] });
}

export async function PATCH(request: Request) {
  const { supabase, user } = await userContext();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const schema = z.object({ id: z.string().uuid(), deviceName: z.string().trim().max(80), quietStart: z.string().regex(/^\d{2}:\d{2}$/).nullable(), quietEnd: z.string().regex(/^\d{2}:\d{2}$/).nullable(), categories: z.array(z.enum(["jobs","recruitment","marketplace","payments","messages"])).min(1) });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid device preferences." }, { status: 400 });
  const { error } = await supabase.from("push_subscriptions").update({ device_name: parsed.data.deviceName || null, quiet_hours_start: parsed.data.quietStart, quiet_hours_end: parsed.data.quietEnd, categories: parsed.data.categories, updated_at: new Date().toISOString() }).eq("id", parsed.data.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
 }
export async function POST(request: Request) {
  const { supabase, user } = await userContext();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = subscriptionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: user.id,
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.keys.p256dh,
    auth: parsed.data.keys.auth,
    user_agent: request.headers.get("user-agent"),
    is_active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { supabase, user } = await userContext();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ endpoint: z.string().url().max(4096).optional(), id: z.string().uuid().optional() }).refine((value) => value.endpoint || value.id).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  let query = supabase.from("push_subscriptions").delete().eq("user_id", user.id);
  query = parsed.data.id ? query.eq("id", parsed.data.id) : query.eq("endpoint", parsed.data.endpoint!);
  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

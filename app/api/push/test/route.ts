import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push/web-push";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await sendPushToUser(user.id, {
    title: "JobiVerse notifications are ready",
    body: "You will now receive important updates even when the app is closed.",
    href: "/account/notifications",
    tag: "push-test",
  });
  if (!result.delivered) return NextResponse.json({ error: "No active device received the notification." }, { status: 503 });
  return NextResponse.json({ ok: true, delivered: result.delivered });
}

import "server-only";
import { buildPushPayload, type PushSubscription } from "@block65/webcrypto-web-push";
import { adminSupabase } from "@/lib/supabase/admin";
import { notificationCategory } from "@/lib/notifications/preferences";

export type JobiVersePushMessage = {
  title: string;
  body: string;
  href?: string;
  tag?: string;
  type?: string;
};

function vapidKeys() {
  return {
    subject: process.env.VAPID_SUBJECT,
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
  };
}

export function pushIsConfigured() {
  const keys = vapidKeys();
  return Boolean(keys.subject && keys.publicKey && keys.privateKey);
}

export async function sendPushToUser(userId: string, message: JobiVersePushMessage) {
  if (!pushIsConfigured()) return { delivered: 0, failed: 0, skipped: true };

  const { data: rows, error } = await adminSupabase
    .from("push_subscriptions")
    .select("id,endpoint,p256dh,auth,quiet_hours_start,quiet_hours_end,categories")
    .eq("user_id", userId)
    .eq("is_active", true);
  if (error || !rows?.length) return { delivered: 0, failed: error ? 1 : 0, skipped: !error };

  let delivered = 0;
  let failed = 0;
  const category = notificationCategory(message.type ?? message.tag ?? "message");
  const localTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
  const eligibleRows = rows.filter((row) => {
    if (row.categories?.length && !row.categories.includes(category)) return false;
    const start = row.quiet_hours_start?.slice(0, 5); const end = row.quiet_hours_end?.slice(0, 5);
    if (!start || !end || start === end) return true;
    const quiet = start < end ? localTime >= start && localTime < end : localTime >= start || localTime < end;
    return !quiet;
  });
  await Promise.all(eligibleRows.map(async (row) => {
    try {
      const subscription: PushSubscription = {
        endpoint: row.endpoint,
        expirationTime: null,
        keys: { p256dh: row.p256dh, auth: row.auth },
      };
      const request = await buildPushPayload(
        { data: JSON.stringify(message), options: { ttl: 60 * 60, urgency: "high" } },
        subscription,
        vapidKeys(),
      );
      const response = await fetch(subscription.endpoint, { ...request, body: Uint8Array.from(request.body).buffer });
      if (response.ok) {
        delivered += 1;
        await adminSupabase.from("push_subscriptions").update({ last_used_at: new Date().toISOString() }).eq("id", row.id);
      } else {
        failed += 1;
        if (response.status === 404 || response.status === 410) {
          await adminSupabase.from("push_subscriptions").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", row.id);
        }
      }
    } catch (error) {
      failed += 1;
      console.error("Push delivery failed", error);
    }
  }));
  return { delivered, failed, skipped: false };
}

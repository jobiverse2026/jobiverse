import "server-only";
import { buildPushPayload, type PushSubscription } from "@block65/webcrypto-web-push";
import { adminSupabase } from "@/lib/supabase/admin";

export type JobiVersePushMessage = {
  title: string;
  body: string;
  href?: string;
  tag?: string;
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
    .select("id,endpoint,p256dh,auth")
    .eq("user_id", userId)
    .eq("is_active", true);
  if (error || !rows?.length) return { delivered: 0, failed: error ? 1 : 0, skipped: !error };

  let delivered = 0;
  let failed = 0;
  await Promise.all(rows.map(async (row) => {
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

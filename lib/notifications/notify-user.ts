import "server-only";
import { adminSupabase } from "@/lib/supabase/admin";
import { sendPushToUser, type JobiVersePushMessage } from "@/lib/push/web-push";

export type UserNotification = JobiVersePushMessage & {
  userId: string;
  type: string;
  referenceId?: string | null;
};

export async function notifyUser(notification: UserNotification) {
  const { error } = await adminSupabase.from("notifications").insert({
    user_id: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.body,
    href: notification.href ?? null,
    reference_id: notification.referenceId ?? null,
  });
  if (error) throw new Error(error.message);
  try {
    await sendPushToUser(notification.userId, notification);
  } catch (error) {
    console.error("Non-blocking push notification failure", error);
  }
}

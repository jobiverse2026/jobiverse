export const notificationCategories = ["jobs", "recruitment", "marketplace", "payments", "messages"] as const;
export type NotificationCategory = (typeof notificationCategories)[number];

export type NotificationPreferences = Record<`in_app_${NotificationCategory}` | `email_${NotificationCategory}`, boolean> & { marketing_email: boolean };

export const defaultNotificationPreferences: NotificationPreferences = {
  in_app_jobs: true,
  in_app_recruitment: true,
  in_app_marketplace: true,
  in_app_payments: true,
  in_app_messages: true,
  email_jobs: true,
  email_recruitment: true,
  email_marketplace: true,
  email_payments: true,
  email_messages: true,
  marketing_email: false,
};

export function notificationCategory(type: string): NotificationCategory {
  if (/job|requirement_assigned/.test(type)) return "jobs";
  if (/application|candidate|interview|placement|offer_update/.test(type)) return "recruitment";
  if (/payment|refund|payout|billing|receipt/.test(type)) return "payments";
  if (/message|support|conversation/.test(type)) return "messages";
  return "marketplace";
}

import { adminSupabase } from "@/lib/supabase/admin";

type PaymentNotificationInput = {
  attemptId: string;
  userId: string;
  targetType: string;
  amount: number;
  paymentId?: string | null;
};

export async function notifyAdminsAboutCapturedPayment({
  attemptId,
  userId,
  targetType,
  amount,
  paymentId,
}: PaymentNotificationInput) {
  const { data: existing } = await adminSupabase
    .from("notifications")
    .select("id")
    .eq("type", "payment_captured")
    .eq("reference_id", attemptId)
    .limit(1)
    .maybeSingle();

  if (existing) return;

  const [{ data: admins }, { data: payer }] = await Promise.all([
    adminSupabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .eq("is_active", true),
    adminSupabase
      .from("users")
      .select("full_name,email")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  if (!admins?.length) return;

  const customer = payer?.full_name || payer?.email || "A JobiVerse user";
  const readableType = targetType.replaceAll("_", " ");

  await adminSupabase.from("notifications").insert(
    admins.map((admin) => ({
      user_id: admin.id,
      type: "payment_captured",
      title: "New payment received",
      message: `${customer} paid INR ${Number(amount).toLocaleString(
        "en-IN",
      )} for ${readableType}.${paymentId ? ` Razorpay ID: ${paymentId}` : ""}`,
      href: "/admin/finance",
      reference_id: attemptId,
    })),
  );
}

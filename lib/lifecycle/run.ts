import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

type Nudge = {
  userId: string;
  key: string;
  reference: string;
  title: string;
  message: string;
  href: string;
};

export async function runLifecycleAutomations() {
  const now = new Date();
  const week = `${now.getUTCFullYear()}-W${String(weekNumber(now)).padStart(2, "0")}`;
  const month = now.toISOString().slice(0, 7);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString();

  const [profiles, staleRequirements, quietServices, pendingPayments] = await Promise.all([
    adminSupabase.from("candidate_profiles").select("user_id,profile_completion").lt("profile_completion", 80).limit(500),
    adminSupabase.from("requirements").select("id,employer_id,job_title,created_at").eq("is_public", true).not("status", "in", '("Closed","Cancelled","Filled")').lte("created_at", sevenDaysAgo).limit(300),
    adminSupabase.from("marketplace_services").select("id,provider_id,title,view_count,total_orders,created_at").eq("status", "published").gt("view_count", 0).eq("total_orders", 0).lte("created_at", sevenDaysAgo).limit(300),
    adminSupabase.from("payment_attempts").select("id,user_id,target_type,created_at").eq("status", "created").lte("created_at", fourteenDaysAgo).limit(300),
  ]);

  const nudges: Nudge[] = [];
  for (const profile of profiles.data ?? []) nudges.push({
    userId: profile.user_id,
    key: "candidate_profile_completion",
    reference: "profile",
    title: "Complete your JobiVerse Card",
    message: `Your profile is ${profile.profile_completion ?? 0}% complete. Add the missing details to improve job matching and employer confidence.`,
    href: "/candidates/profile",
  });

  for (const requirement of staleRequirements.data ?? []) {
    const { count } = await adminSupabase.from("candidate_applications").select("id", { count: "exact", head: true }).eq("requirement_id", requirement.id);
    if ((count ?? 0) === 0) nudges.push({
      userId: requirement.employer_id,
      key: "employer_role_no_applicants",
      reference: requirement.id,
      title: "Your role needs a visibility boost",
      message: `${requirement.job_title} has not received an application yet. Review the details or explore JobiVerse hiring support.`,
      href: `/employers/requirements/${requirement.id}`,
    });
  }

  for (const service of quietServices.data ?? []) if (service.provider_id) nudges.push({
    userId: service.provider_id,
    key: "creator_service_no_orders",
    reference: service.id,
    title: "Turn service views into bookings",
    message: `${service.title} is receiving views but has no order yet. Improve the offer, proof and delivery promise.`,
    href: "/earn-with-jobiverse/dashboard/services",
  });

  for (const payment of pendingPayments.data ?? []) nudges.push({
    userId: payment.user_id,
    key: "unfinished_payment",
    reference: payment.id,
    title: "Your checkout is still incomplete",
    message: "A JobiVerse payment was started but not completed. You can safely review it from your orders.",
    href: payment.target_type === "resume_download" ? "/candidates/resume/templates/owned" : "/marketplace/orders",
  });

  let queued = 0;
  for (const nudge of nudges) {
    if (!nudge.userId) continue;
    const cycle = nudge.key === "unfinished_payment" ? month : week;
    const { data, error } = await adminSupabase.rpc("queue_lifecycle_notification", {
      target_user: nudge.userId,
      automation_key_input: nudge.key,
      reference_key_input: nudge.reference,
      cycle_key_input: cycle,
      title_input: nudge.title,
      message_input: nudge.message,
      href_input: nudge.href,
      notification_type_input: "lifecycle_nudge",
    });
    if (!error && data === true) queued += 1;
  }
  return { considered: nudges.length, queued, cycle: week };
}

function weekNumber(date: Date) {
  const first = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - first.getTime()) / 86400000) + first.getUTCDay() + 1) / 7);
}

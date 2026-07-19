import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { getLaunchReadiness } from "@/lib/launch-readiness";

export async function GET() {
  try {
    const { supabase } = await requireRole(["admin"]);
    const [
      unreadNotifications,
      requirements,
      companies,
      candidates,
      recruiters,
      billing,
      marketplace,
      serviceReports,
      reviewReports,
      templateReviews,
      payouts,
      payoutAccounts,
      refunds,
      reports,
      jobReports,
      consultations,
      privacyRequests,
      campusEnquiries,
      membershipRequests,
      credentialReviews,
      support,
      emailFailures,
    ] = await Promise.all([
      supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null),
      supabase.from("requirements").select("id", { count: "exact", head: true }).eq("hiring_team_requested", true).not("status", "in", '("Closed","Cancelled")'),
      supabase.from("companies").select("id", { count: "exact", head: true }),
      supabase.from("candidates").select("id", { count: "exact", head: true }).or("recruiter_name.eq.JobiVerse Hiring Team,recruiter_email.eq.jobiverse@outlook.com").not("status", "in", '("Joined","Rejected","Withdrawn")'),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "recruiter").eq("is_active", true),
      supabase.from("placements").select("id", { count: "exact", head: true }).in("payment_status", ["not_invoiced", "invoiced", "partially_paid", "overdue"]),
      supabase.from("marketplace_orders").select("id", { count: "exact", head: true }).eq("status", "completed").in("payout_status", ["eligible", "held"]),
      supabase.from("marketplace_service_reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
      supabase.from("marketplace_review_reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
      supabase.from("marketplace_services").select("id",{count:"exact",head:true}).eq("is_editable",true).eq("template_review_status","pending"),
      supabase.from("creator_payout_requests").select("id", { count: "exact", head: true }).in("status", ["requested", "approved"]),
      supabase.from("creator_payout_profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("marketplace_refund_requests").select("id", { count: "exact", head: true }).eq("status", "requested"),
      supabase.from("marketplace_message_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
      adminSupabase.from("job_reports").select("id", { count: "exact", head: true }).in("status", ["open", "reviewing"]),
      adminSupabase.from("consultation_bookings").select("id", { count: "exact", head: true }).eq("status", "requested"),
      adminSupabase.from("privacy_requests").select("id", { count: "exact", head: true }).in("status", ["submitted", "in_review"]),
      adminSupabase.from("campus_partnership_enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      adminSupabase.from("platform_subscriptions").select("id", { count: "exact", head: true }).eq("status", "requested"),
      adminSupabase.from("career_passport_items").select("id", { count: "exact", head: true }).eq("item_type", "credential").in("verification_status", ["self_declared", "pending"]).not("evidence_url", "is", null),
      supabase.from("support_conversations").select("unread_for_admin"),
      adminSupabase.from("transactional_email_outbox").select("id", { count: "exact", head: true }).eq("status", "failed"),
    ]);
    return Response.json({
      "/admin": unreadNotifications.count ?? 0,
      "/admin/requirements": requirements.count ?? 0,
      "/admin/companies": companies.count ?? 0,
      "/admin/candidates": candidates.count ?? 0,
      "/admin/recruiters": recruiters.count ?? 0,
      "/admin/analytics": 0,
      "/admin/growth": 0,
      "/admin/campus": campusEnquiries.count ?? 0,
      "/admin/memberships": membershipRequests.count ?? 0,
      "/admin/credentials": credentialReviews.count ?? 0,
      "/admin/billing": billing.count ?? 0,
      "/admin/marketplace": (marketplace.count ?? 0) + (serviceReports.count ?? 0) + (reviewReports.count ?? 0),
      "/admin/templates":templateReviews.count??0,
      "/admin/finance": payouts.count ?? 0,
      "/admin/payout-accounts": payoutAccounts.count ?? 0,
      "/admin/refunds": refunds.count ?? 0,
      "/admin/message-reports": reports.count ?? 0,
      "/admin/trust-safety": jobReports.count ?? 0,
      "/admin/consultations": consultations.count ?? 0,
      "/admin/privacy-requests": privacyRequests.count ?? 0,
      "/admin/support": (support.data ?? []).reduce((sum, item) => sum + item.unread_for_admin, 0),
      "/admin/email-delivery": emailFailures.count ?? 0,
      "/admin/settings": getLaunchReadiness().missing,
    });
  } catch {
    return Response.json({}, { status: 403 });
  }
}

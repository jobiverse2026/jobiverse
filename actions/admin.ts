"use server";

import { requireRole } from "@/lib/auth/authorization";

export async function getDashboardData() {
  const { supabase } = await requireRole(["admin"]);

  const [
    requirements,
    openRequirements,
    jobiverseRequirements,
    companies,
    verifiedCompanies,
    candidates,
    externalApplicants,
    employers,
    creators,
    pendingServices,
    activeOrders,
    pendingRefunds,
    pendingPayoutAccounts,
    unreadSupport,
    leakageWatchlist,
  ] = await Promise.all([
    supabase.from("requirements").select("id", { count: "exact", head: true }),
    supabase.from("requirements").select("id", { count: "exact", head: true }).eq("hiring_team_requested", true).not("status", "in", '("Closed","Cancelled")'),
    supabase.from("requirements").select("id", { count: "exact", head: true }).eq("hiring_team_requested", true),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_verified", true),
    supabase.from("candidates").select("id", { count: "exact", head: true }),
    supabase.from("candidate_applications").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "employer"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "creator"),
    supabase.from("marketplace_services").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("marketplace_orders").select("id", { count: "exact", head: true }).in("status", ["paid", "in_progress", "delivered", "revision_requested"]),
    supabase.from("marketplace_refund_requests").select("id", { count: "exact", head: true }).in("status", ["requested", "gateway_pending"]),
    supabase.from("creator_payout_profiles").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("support_conversations").select("id", { count: "exact", head: true }).gt("unread_for_admin", 0),
    supabase
      .from("candidates")
      .select("id, full_name, status, created_at, recruiter_name, recruiter_email, source, requirements(job_title, companies(company_name))")
      .or("source.eq.jobiverse_hiring_team,recruiter_email.eq.jobiverse@outlook.com,recruiter_name.eq.JobiVerse Hiring Team")
      .in("status", ["Client Submitted", "Interview", "Selected", "Offered"])
      .order("created_at", { ascending: true })
      .limit(6),
  ]);

  const { data: latestRequirements } = await supabase
    .from("requirements")
    .select(`
      id,
      job_title,
      status,
      created_at,
      companies (
        company_name,
        location
      )
    `)
    .eq("hiring_team_requested", true)
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  const { data: latestOrders } = await supabase
    .from("marketplace_orders")
    .select("id, service_title, status, amount, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  return {
    stats: {
      requirements: requirements.count ?? 0,
      openRequirements: openRequirements.count ?? 0,
      jobiverseRequirements: jobiverseRequirements.count ?? 0,
      companies: companies.count ?? 0,
      verifiedCompanies: verifiedCompanies.count ?? 0,
      candidates: candidates.count ?? 0,
      externalApplicants: externalApplicants.count ?? 0,
      employers: employers.count ?? 0,
      creators: creators.count ?? 0,
      pendingServices: pendingServices.count ?? 0,
      activeOrders: activeOrders.count ?? 0,
      pendingRefunds: pendingRefunds.count ?? 0,
      pendingPayoutAccounts: pendingPayoutAccounts.count ?? 0,
      unreadSupport: unreadSupport.count ?? 0,
    },

    latestRequirements: latestRequirements ?? [],
    latestOrders: latestOrders ?? [],
    leakageWatchlist: leakageWatchlist.data ?? [],
  };
}

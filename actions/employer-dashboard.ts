"use server";

import { requireRole } from "@/lib/auth/authorization";
import { adminSupabase } from "@/lib/supabase/admin";
import { getEmployerCompanyAccess, scopeEmployerRequirementQuery } from "@/lib/employer-team/access";

export async function getEmployerCommandCenterData() {
  const { user } = await requireRole(["employer"]);
  const access = await getEmployerCompanyAccess(user.id);
  const company = access.company;

  const requirementQuery = scopeEmployerRequirementQuery(
    adminSupabase.from("requirements").select("id,status"),
    access,
    user.id,
  );
  const { data: requirements, error } = await requirementQuery;
  if (error) throw new Error(error.message);

  const requirementRows = (requirements ?? []) as Array<{ id: string; status: string | null }>;
  const requirementIds = requirementRows.map((item) => item.id);
  const activeRequirements = requirementRows.filter((item) =>
    !["closed", "cancelled"].includes(String(item.status ?? "").trim().toLowerCase()),
  ).length;

  const [candidateResult, subscriptionResult] = await Promise.all([
    requirementIds.length
      ? adminSupabase.from("candidates").select("id", { count: "exact", head: true }).in("requirement_id", requirementIds)
      : Promise.resolve({ count: 0 }),
    adminSupabase
      .from("platform_subscriptions")
      .select("platform_plans(slug)")
      .eq("user_id", company.owner_id)
      .eq("status", "active"),
  ]);

  const activePlans = (subscriptionResult.data ?? []).flatMap((row) => {
    const plans = row.platform_plans as Array<{ slug: string }> | { slug: string } | null;
    return Array.isArray(plans) ? plans : plans ? [plans] : [];
  });

  return {
    companyName: company.company_name,
    industry: company.industry,
    activeRequirements,
    candidates: candidateResult.count ?? 0,
    coreActive: activePlans.some((plan) =>
      ["employer-starter", "employer-growth", "employer-enterprise"].includes(plan.slug),
    ),
  };
}

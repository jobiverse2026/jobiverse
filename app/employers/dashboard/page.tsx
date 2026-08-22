import DashboardLayout from "./DashboardLayout";
import { getEmployerDashboardData } from "@/actions/employer-dashboard";
import { getCompany } from "@/actions/company";
import { EmployerCommandCenter } from "@/components/employer/EmployerCommandCenter";

export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const [data, company] = await Promise.all([getEmployerDashboardData(), getCompany()]);
  return (
    <DashboardLayout>
      <EmployerCommandCenter
        companyName={company?.company_name}
        industry={company?.industry}
        activeRequirements={data.stats.activeRequirements}
        candidates={data.stats.candidates}
        coreActive={data.entitlements.coreSubscriptionActive}
      />
    </DashboardLayout>
  );
}

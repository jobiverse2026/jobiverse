import DashboardLayout from "./DashboardLayout";
import { getEmployerCommandCenterData } from "@/actions/employer-dashboard";
import { EmployerCommandCenter } from "@/components/employer/EmployerCommandCenter";

export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const data = await getEmployerCommandCenterData();
  return (
    <DashboardLayout>
      <EmployerCommandCenter
        companyName={data.companyName}
        industry={data.industry}
        activeRequirements={data.activeRequirements}
        candidates={data.candidates}
        coreActive={data.coreActive}
      />
    </DashboardLayout>
  );
}

import DashboardLayout from "./DashboardLayout";
import DashboardHeader from "./DashboardHeader";
import StatsCards from "./StatsCards";
import QuickActions from "./QuickActions";
import RecentRequirements from "./RecentRequirements";
import RecentCandidates from "./RecentCandidates";
import HiringPipeline from "./HiringPipeline";
import ActivityFeed from "./ActivityFeed";
import { getEmployerDashboardData } from "@/actions/employer-dashboard";
import ExternalApplicantsCard from "./ExternalApplicantsCard";
import JobiverseSubmittedCard from "./JobiverseSubmittedCard";

export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const data = await getEmployerDashboardData();
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DashboardHeader />

        <StatsCards stats={data.stats} />

        <div className="grid gap-5 xl:grid-cols-2">
          <JobiverseSubmittedCard />
          <ExternalApplicantsCard />
        </div>

        <QuickActions />

        <div className="grid gap-8 xl:grid-cols-2">
          <RecentRequirements requirements={data.recentRequirements} />
          <RecentCandidates candidates={data.recentCandidates} />
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <HiringPipeline pipeline={data.pipeline} />
          <ActivityFeed requirements={data.recentRequirements} candidates={data.recentCandidates} />
        </div>
      </div>
    </DashboardLayout>
  );
}

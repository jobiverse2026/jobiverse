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
import HiringHealthCard from "./HiringHealthCard";
import FreeHiringCard from "./FreeHiringCard";
import SubscriptionToolsSection from "./SubscriptionToolsSection";

export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const data = await getEmployerDashboardData();
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DashboardHeader />

        <FreeHiringCard />

        <section>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-700">Free hiring workspace</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-.04em] text-zinc-950">Post, receive applications and hire.</h2>
              <p className="mt-2 text-sm text-zinc-500">These tools remain available without an employer subscription.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-emerald-800">Free access</span>
          </div>
        </section>

        <StatsCards stats={data.stats} />

        <ExternalApplicantsCard />

        <QuickActions />

        <RecentRequirements requirements={data.recentRequirements} />

        <SubscriptionToolsSection entitlements={data.entitlements} />

        {data.entitlements.coreSubscriptionActive && (
          <section id="hiring-intelligence" className="scroll-mt-32 space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Subscription intelligence</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-zinc-950">Your complete hiring operation.</h2>
            </div>
            <HiringHealthCard score={data.stats.hiringHealthScore} activeRequirements={data.stats.activeRequirements} candidates={data.stats.candidates} interviews={data.stats.interviews} positionsClosed={data.stats.positionsClosed} />
            <JobiverseSubmittedCard />
            <div className="grid gap-8 xl:grid-cols-2">
              <RecentCandidates candidates={data.recentCandidates} />
              <HiringPipeline pipeline={data.pipeline} />
            </div>
            <ActivityFeed requirements={data.recentRequirements} candidates={data.recentCandidates} />
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

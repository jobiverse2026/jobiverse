import { TalentSearchExperience } from "@/components/talent/TalentSearchExperience";
import { requireRole } from "@/lib/auth/authorization";

export default async function RecruiterTalentSearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { user } = await requireRole(["recruiter"]);
  return <TalentSearchExperience role="recruiter" userId={user.id} searchParams={await searchParams} />;
}

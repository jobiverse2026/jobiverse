import { TalentSearchExperience } from "@/components/talent/TalentSearchExperience";
import { requireRole } from "@/lib/auth/authorization";

export default async function EmployerTalentSearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { user } = await requireRole(["employer"]);
  return <TalentSearchExperience role="employer" userId={user.id} searchParams={await searchParams} />;
}

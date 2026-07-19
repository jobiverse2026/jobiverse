import LoginShell from "@/components/auth/LoginShell";
import SignupCard from "@/components/auth/SignupCard";

type Role = "candidate" | "employer" | "recruiter" | "admin" | "creator";
const validRoles: Role[] = ["candidate", "employer", "recruiter", "admin", "creator"];

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; ref?: string; next?: string }>;
}) {
  const params = await searchParams;
  const role = validRoles.includes(params.role as Role)
    ? (params.role as Role)
    : "candidate";

  return (
    <LoginShell>
      <SignupCard role={role} referralCode={params.ref} nextPath={params.next} />
    </LoginShell>
  );
}

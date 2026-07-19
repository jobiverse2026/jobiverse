import LoginShell from "@/components/auth/LoginShell";
import LoginCard from "@/components/auth/LoginCard";

export default function Page() {
  return (
    <LoginShell>
      <LoginCard role="recruiter" />
    </LoginShell>
  );
}
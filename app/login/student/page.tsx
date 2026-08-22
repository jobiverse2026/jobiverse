import LoginShell from "@/components/auth/LoginShell";
import LoginCard from "@/components/auth/LoginCard";

export default function StudentLoginPage() {
  return (
    <LoginShell>
      <LoginCard role="candidate" portal="student" />
    </LoginShell>
  );
}

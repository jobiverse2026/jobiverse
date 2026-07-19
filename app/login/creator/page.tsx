import LoginCard from "@/components/auth/LoginCard";
import LoginShell from "@/components/auth/LoginShell";

export default function CreatorLoginPage() {
  return <LoginShell><LoginCard role="creator" /></LoginShell>;
}

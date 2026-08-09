import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  try {
    await requireRole(["candidate", "employer", "recruiter", "creator"]);
  } catch {
    redirect("/login?next=%2Faccount%2Fonboarding");
  }

  return children;
}

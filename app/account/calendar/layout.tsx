import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/authorization";

export default async function CalendarLayout({ children }: { children: ReactNode }) {
  try {
    await requireRole(["employer", "recruiter"]);
  } catch {
    redirect("/login?next=%2Faccount%2Fcalendar");
  }

  return children;
}

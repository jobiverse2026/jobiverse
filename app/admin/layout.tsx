import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { requireRole } from "@/lib/auth/authorization";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  let authorized = false;

  try {
    await requireRole(["admin"]);
    authorized = true;
  } catch {
    authorized = false;
  }

  if (!authorized) {
    redirect("/login/admin?access=denied");
  }

  return <AdminShell>{children}</AdminShell>;
}

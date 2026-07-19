"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,white,transparent_28%),radial-gradient(circle_at_88%_20%,rgba(24,24,27,.08),transparent_24%)] bg-[#f5f5f3]">
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-36">
        {children}
      </main>

    </div>
  );
}

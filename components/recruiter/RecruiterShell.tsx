"use client";

import { useState, type ReactNode } from "react";

import Sidebar from "@/components/recruiter/Sidebar";
import Topbar from "@/components/recruiter/Topbar";

export default function RecruiterShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 sm:pt-28">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button type="button" aria-label="Close recruiter navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-[55] cursor-default bg-black/40 backdrop-blur-sm lg:hidden" />}
      <div className="min-h-[calc(100vh-6rem)] lg:ml-72">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

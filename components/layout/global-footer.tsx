"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";

export function GlobalFooter() {
  const pathname = usePathname();
  const authPage = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/auth");
  const sidebarPage = pathname.startsWith("/admin") || pathname.startsWith("/recruiter");
  return authPage ? null : <div className={sidebarPage ? "lg:pl-[270px]" : ""}><Footer /></div>;
}

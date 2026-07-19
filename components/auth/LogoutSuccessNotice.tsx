"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function LogoutSuccessNotice() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (pathname !== "/" || window.sessionStorage.getItem("jobiverse:logout-success") !== "true") return;
    window.sessionStorage.removeItem("jobiverse:logout-success");
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 3500);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  if (!visible) return null;
  return <div role="status" className="fixed bottom-6 left-1/2 z-[10001] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-emerald-200 bg-white/95 px-5 py-4 text-sm font-semibold text-zinc-900 shadow-2xl backdrop-blur-xl"><CheckCircle2 className="text-emerald-600" size={20} /> Successfully logged out.</div>;
}

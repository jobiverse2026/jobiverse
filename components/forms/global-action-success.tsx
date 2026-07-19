"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

const messages: Record<string, string> = {
  passport_saved: "JobiVerse Card saved successfully.",
  passport_item_added: "Evidence added to your JobiVerse Card successfully.",
  passport_item_removed: "JobiVerse Card evidence removed successfully.",
  plan_requested: "Plan request submitted successfully.",
  plan_cancelled: "Plan cancelled successfully.",
  event_registered: "Event registration completed successfully.",
  event_cancelled: "Event registration cancelled successfully.",
  privacy_saved: "Privacy choices saved successfully.",
  privacy_requested: "Privacy request submitted successfully.",
  profile_saved: "Account profile saved successfully.",
};

export function GlobalActionSuccess() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const code = searchParams.get("success");
  const [visible, setVisible] = useState(Boolean(code));

  useEffect(() => setVisible(Boolean(code)), [code]);
  if (!code || !visible) return null;

  const close = () => {
    setVisible(false);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("success");
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 z-[100] w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white p-4 shadow-[0_24px_70px_-24px_rgba(5,150,105,.5)]">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 size={20}/></span>
        <p className="min-w-0 flex-1 text-sm font-semibold text-zinc-800">{messages[code] ?? "Action completed successfully."}</p>
        <button type="button" onClick={close} aria-label="Close confirmation" className="cursor-pointer rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"><X size={17}/></button>
      </div>
    </div>
  );
}

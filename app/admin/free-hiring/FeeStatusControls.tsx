"use client";

import { useState, useTransition } from "react";
import { updateDirectHireFeeStatus } from "./actions";

export default function FeeStatusControls({ applicationId, currentStatus }: { applicationId: string; currentStatus: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function update(status: "due" | "invoiced" | "paid" | "waived") {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await updateDirectHireFeeStatus(applicationId, status);
        setMessage(result.success);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to update fee status.");
      }
    });
  }
  return <div>
    <div className="flex flex-wrap gap-2">{(["due", "invoiced", "paid", "waived"] as const).map((status) => <button key={status} type="button" disabled={pending || status === currentStatus} onClick={() => update(status)} className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold capitalize transition hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-40">{status}</button>)}</div>
    {message && <p className="mt-2 text-xs font-semibold text-emerald-700">{message}</p>}
  </div>;
}

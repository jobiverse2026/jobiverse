"use client";

import { useState, useTransition } from "react";
import { setOpenToWorkPreference } from "@/actions/candidate-profile";

export function OpenToWorkToggle({ initialOpen }: { initialOpen: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(next: boolean) {
    setOpen(next);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const result = await setOpenToWorkPreference(next);
        setMessage(result.success);
      } catch (cause) {
        setOpen(!next);
        setError(cause instanceof Error ? cause.message : "Unable to update open to work status.");
      }
    });
  }

  return (
    <div className="mt-5 shrink-0 md:mt-0">
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm font-semibold text-zinc-700">
        <input
          type="checkbox"
          checked={open}
          onChange={(event) => toggle(event.target.checked)}
          disabled={pending}
          className="peer sr-only"
        />
        <span className="relative h-8 w-14 rounded-full bg-zinc-300 transition peer-checked:bg-emerald-600 peer-disabled:opacity-60 after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-6" />
        <span className={open ? "text-emerald-700" : "text-zinc-600"}>
          {pending ? "Updating..." : open ? "Open to work" : "Not open to work"}
        </span>
      </label>
      {message && <p className="mt-3 max-w-xs text-xs font-semibold text-emerald-700">{message}</p>}
      {error && <p className="mt-3 max-w-xs text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

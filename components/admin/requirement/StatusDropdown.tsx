"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateRequirementStatus } from "@/actions/requirements";

type Props = {
  id: string;
  currentStatus: string;
};

const statuses = [
  "New",
  "Assigned",
  "Sourcing",
  "Interview",
  "Offer",
  "Joined",
  "Closed",
];

export default function StatusDropdown({
  id,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  async function handleChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const status = e.target.value;

    startTransition(async () => {
      const result = await updateRequirementStatus(
        id,
        status
      );

      if (!result.success) {
        alert(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">

      <label className="text-sm font-medium text-zinc-500">
        Change Status
      </label>

      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="
        w-full
        rounded-xl
        border
        border-zinc-300
        bg-white
        px-4
        py-3
        outline-none
        focus:border-black
        "
      >
        {statuses.map((status) => (
          <option
            key={status}
            value={status}
          >
            {status}
          </option>
        ))}
      </select>

    </div>
  );
}
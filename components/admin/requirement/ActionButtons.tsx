import Link from "next/link";

export default function ActionButtons() {

  return (

    <div className="flex flex-wrap gap-4">

      <Link
        href="/admin/requirements"
        className="
        rounded-xl
        border
        border-zinc-300
        px-6
        py-3
        font-semibold
        hover:bg-zinc-100
        "
      >
        ← Back
      </Link>

      <button
        className="
        rounded-xl
        bg-blue-600
        px-6
        py-3
        font-semibold
        text-white
        hover:bg-blue-700
        "
      >
        Assign Recruiter
      </button>

      <button
        className="
        rounded-xl
        bg-amber-500
        px-6
        py-3
        font-semibold
        text-white
        hover:bg-amber-600
        "
      >
        Change Status
      </button>

      <button
        className="
        rounded-xl
        bg-red-600
        px-6
        py-3
        font-semibold
        text-white
        hover:bg-red-700
        "
      >
        Delete Requirement
      </button>

    </div>

  );

}
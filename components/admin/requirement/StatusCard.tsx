import StatusDropdown from "./StatusDropdown";
type Props = {
  requirement: any;
};

export default function StatusCard({
  requirement,
}: Props) {

  const badge =
    requirement.status === "New"
      ? "bg-green-100 text-green-700"
      : requirement.status === "Assigned"
      ? "bg-blue-100 text-blue-700"
      : requirement.status === "Interview"
      ? "bg-yellow-100 text-yellow-700"
      : requirement.status === "Closed"
      ? "bg-red-100 text-red-700"
      : "bg-zinc-100 text-zinc-700";

  return (

    <div className="rounded-3xl border border-zinc-200 bg-white p-8">

      <h2 className="text-2xl font-bold">
        Requirement Status
      </h2>

      <div className="mt-8 space-y-6">

        <div>

          <p className="text-sm text-zinc-500">
            Status
          </p>

          <span
            className={`mt-2 inline-flex rounded-full px-4 py-2 font-semibold ${badge}`}
          >
            {requirement.status}
          </span>

        </div>

        <Info
          title="Created"
          value={new Date(
            requirement.created_at
          ).toLocaleString()}
        />

        <Info
          title="Requirement ID"
          value={requirement.id}
        />

        <StatusDropdown
  id={requirement.id}
  currentStatus={requirement.status}
/>

      </div>

    </div>

  );

}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (

    <div>

      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-1 break-all font-semibold">
        {value}
      </p>

    </div>

  );

}
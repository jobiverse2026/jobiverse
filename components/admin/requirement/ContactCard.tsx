import { User } from "lucide-react";

type Props = {
  contact: any;
};

export default function ContactCard({ contact }: Props) {

  return (

    <div className="rounded-3xl border border-zinc-200 bg-white p-8">

      <div className="flex items-center gap-3">

        <User className="h-6 w-6" />

        <h2 className="text-2xl font-bold">
          Contact Person
        </h2>

      </div>

      <div className="mt-8 space-y-6">

        <Info title="Full Name" value={contact?.full_name} />

        <Info title="Designation" value={contact?.designation} />

        <Info title="Email" value={contact?.email} />

        <Info title="Phone" value={contact?.phone} />

      </div>

    </div>

  );

}

function Info({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {
  return (
    <div>

      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-1 font-semibold break-all">
        {value || "-"}
      </p>

    </div>
  );
}
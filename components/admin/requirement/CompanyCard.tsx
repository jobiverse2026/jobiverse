import { Building2 } from "lucide-react";

type Props = {
  company: any;
};

export default function CompanyCard({ company }: Props) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8">

      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6" />
        <h2 className="text-2xl font-bold">
          Company Information
        </h2>
      </div>

      <div className="mt-8 space-y-6">

        <Info
          title="Company Name"
          value={company?.company_name}
        />

        <Info
          title="Industry"
          value={company?.industry}
        />

        <Info
          title="Website"
          value={company?.website}
        />

        <Info
          title="Company Size"
          value={company?.company_size}
        />

        <Info
          title="Location"
          value={company?.location}
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
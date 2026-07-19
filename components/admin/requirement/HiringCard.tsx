type Props = {
  requirement: any;
};

export default function HiringCard({
  requirement,
}: Props) {

  return (

    <div className="rounded-3xl border border-zinc-200 bg-white p-8">

      <h2 className="text-2xl font-bold">
        Hiring Details
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        <Info title="Job Title" value={requirement.job_title} />

        <Info title="Department" value={requirement.department} />

        <Info title="Experience" value={requirement.experience} />

        <Info title="Employment Type" value={requirement.employment_type} />

        <Info title="Work Mode" value={requirement.work_mode} />

        <Info title="Budget CTC" value={requirement.budget_ctc} />

        <Info
  title="Vacancies"
  value={String(requirement.vacancies ?? "-")}
/>

        <Info
          title="Openings"
          value={String(requirement.openings)}
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

      <p className="mt-1 font-semibold">
        {value || "-"}
      </p>

    </div>
  );
}
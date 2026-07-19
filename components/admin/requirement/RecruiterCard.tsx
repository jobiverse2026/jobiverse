import RecruiterDropdown from "./RecruiterDropdown";

type Recruiter = {
  id: string;
  email: string;
  role: string;
};

type Props = {
  requirement: any;
  recruiters: Recruiter[];
};

export default function RecruiterCard({
  requirement,
  recruiters,
}: Props) {
  return (
    <div
      className="
      rounded-3xl
      border
      border-zinc-200
      bg-white
      p-8
      "
    >
      <h2 className="text-2xl font-bold">
        Recruiter Assignment
      </h2>

      <div className="mt-8 space-y-6">

        <div>
          <p className="text-sm text-zinc-500">
            Assigned Recruiter
          </p>

          <p className="mt-2 font-semibold">
            {requirement.assigned_recruiter ?? "Not Assigned"}
          </p>
        </div>

        <div>
          <p className="text-sm text-zinc-500">
            Recruiter Email
          </p>

          <p className="mt-2 font-semibold break-all">
            {requirement.assigned_email ?? "-"}
          </p>
        </div>

        <RecruiterDropdown
  requirementId={requirement.id}
  currentRecruiterId={requirement.assigned_recruiter}
  recruiters={recruiters}
/>

      </div>
    </div>
  );
}

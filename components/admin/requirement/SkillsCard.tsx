type Props = {
  requirement: any;
};

export default function SkillsCard({
  requirement,
}: Props) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8">
      <h2 className="text-2xl font-bold">
        Required Skills
      </h2>

      <div className="mt-8">
        <p className="text-sm text-zinc-500">
          Skills
        </p>

        <div className="mt-2 rounded-xl bg-zinc-100 p-4 font-medium whitespace-pre-wrap">
          {requirement.skills || "-"}
        </div>
      </div>
    </div>
  );
}
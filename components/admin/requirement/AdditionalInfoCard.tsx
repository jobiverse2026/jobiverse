type Props = {
  requirement: any;
};

export default function AdditionalInfoCard({
  requirement,
}: Props) {

  return (

    <div className="rounded-3xl border border-zinc-200 bg-white p-8">

      <h2 className="text-2xl font-bold">
        Additional Information
      </h2>

      <div
        className="
        mt-8
        whitespace-pre-wrap
        rounded-2xl
        bg-zinc-50
        p-6
        leading-8
        text-zinc-700
        "
      >
        {requirement.additional_information ||
          "No Additional Information"}
      </div>

    </div>

  );

}
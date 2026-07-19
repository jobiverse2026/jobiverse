"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { assignRecruiter } from "@/actions/recruiters";


type Recruiter = {
  id: string;
  email: string;
  role: string;
};


type Props = {
  requirementId: string;
  currentRecruiterId?: string | null;
  recruiters: Recruiter[];
};


export default function RecruiterDropdown({
  requirementId,
  currentRecruiterId,
  recruiters,
}: Props) {


  const router = useRouter();

  const [isPending, startTransition] = useTransition();



  function handleChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {


    const recruiterId = e.target.value;


    if (!recruiterId) return;



    startTransition(async () => {


      const result = await assignRecruiter(
        requirementId,
        recruiterId
      );


      if (!result.success) {

        alert(result.error);

        return;

      }



      alert("Recruiter Assigned Successfully!");

      router.refresh();


    });


  }



  return (

    <div className="space-y-2">


      <label className="text-sm font-medium text-zinc-500">

        Assign Recruiter

      </label>



      <select

        defaultValue={currentRecruiterId ?? ""}

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
        transition
        focus:border-black
        "

      >


        <option value="">

          Select Recruiter

        </option>



        {recruiters.map((recruiter) => (

          <option

            key={recruiter.id}

            value={recruiter.id}

          >

            {recruiter.email}

          </option>


        ))}



      </select>


    </div>

  );

}
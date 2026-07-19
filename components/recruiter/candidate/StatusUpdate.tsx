"use client";

import { useState } from "react";

import { updateCandidateStatus } from "@/actions/candidate-status";


type Props = {
  id: string;
  currentStatus: string;
};


export default function StatusUpdate({
  id,
  currentStatus,
}: Props) {


  const [loading, setLoading] = useState(false);



  async function changeStatus(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {


    setLoading(true);


    await updateCandidateStatus(
      id,
      e.target.value
    );


    window.location.reload();

  }



  return (

    <select
      defaultValue={currentStatus}
      disabled={loading}
      onChange={changeStatus}
      className="
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

      <option value="Submitted">
        Submitted
      </option>


      <option value="Screening">
        Screening
      </option>


      <option value="Client Submitted">
        Client Submitted
      </option>


      <option value="Interview">
        Interview
      </option>


      <option value="Selected">
        Selected
      </option>


      <option value="Rejected">
        Rejected
      </option>


    </select>

  );

}
"use client";

import { useState } from "react";
import ResumeUpload from "./ResumeUpload";
import { createCandidate } from "@/actions/candidates";


type Props = {
  requirement: any;
};

export default function CandidateForm({
  requirement,
}: Props) {

  const [loading, setLoading] = useState(false);
   const [resumeFile, setResumeFile] = useState<File | null>(null);

   const handleSubmit = async (
e: React.FormEvent<HTMLFormElement>
)=>{

e.preventDefault();

const form = e.currentTarget;

setLoading(true);


try {


const formData =
new FormData(e.currentTarget);



if(resumeFile){

formData.append(
"resume",
resumeFile
);

}



await createCandidate(
formData
);



alert(
"Candidate submitted successfully"
);



form.reset();
setResumeFile(null);



}
catch(error){

console.error(error);


alert(error instanceof Error ? error.message : "Candidate submission failed.");


}
finally{

setLoading(false);

}

};

  return (

  <form
onSubmit={handleSubmit}
className="
rounded-3xl
border
bg-white
p-8
"
>

      <h2 className="text-2xl font-bold">
        Candidate Details
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        {/* Candidate Name */}

        <div>

          <label className="text-sm font-medium">
            Full Name *
          </label>

          <input
            type="text"
            name="full_name"
            required
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Email */}

        <div>

          <label className="text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Phone */}

        <div>

          <label className="text-sm font-medium">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Experience */}

        <div>

          <label className="text-sm font-medium">
            Total Experience
          </label>

          <input
            type="text"
            name="total_experience"
            placeholder="4 Years"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Current Company */}

        <div>

          <label className="text-sm font-medium">
            Current Company
          </label>

          <input
            type="text"
            name="current_company"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Current Location */}

        <div>

          <label className="text-sm font-medium">
            Current Location
          </label>

          <input
            type="text"
            name="current_location"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Current CTC */}

        <div>

          <label className="text-sm font-medium">
            Current CTC
          </label>

          <input
            type="text"
            name="current_ctc"
            placeholder="8 LPA"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Expected CTC */}

        <div>

          <label className="text-sm font-medium">
            Expected CTC
          </label>

          <input
            type="text"
            name="expected_ctc"
            placeholder="10 LPA"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Notice Period */}

        <div>

          <label className="text-sm font-medium">
            Notice Period
          </label>

          <input
            type="text"
            name="notice_period"
            placeholder="30 Days"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>


              {/* Primary Skills */}

        <div>

          <label className="text-sm font-medium">
            Primary Skills
          </label>

          <input
            type="text"
            name="primary_skills"
            placeholder="React, Node.js, SQL"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Secondary Skills */}

        <div>

          <label className="text-sm font-medium">
            Secondary Skills
          </label>

          <input
            type="text"
            name="secondary_skills"
            placeholder="AWS, Docker"
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* LinkedIn */}

        <div className="md:col-span-2">

          <label className="text-sm font-medium">
            LinkedIn Profile
          </label>

          <input
            type="url"
            name="linkedin"
            placeholder="https://linkedin.com/in/..."
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            px-4
            py-3
            outline-none
            focus:border-black
            "
          />

        </div>

        {/* Resume URL */}

       {/* Resume Upload */}

<div className="md:col-span-2">

  <ResumeUpload
    onFileSelect={setResumeFile}
  />

</div>
        {/* Remarks */}

        <div className="md:col-span-2">

          <label className="text-sm font-medium">
            Recruiter Remarks
          </label>

          <textarea
            name="remarks"
            rows={5}
            placeholder="Internal recruiter notes..."
            className="
            mt-2
            w-full
            rounded-xl
            border
            border-zinc-300
            p-4
            outline-none
            focus:border-black
            "
          />

        </div>

      </div>

      {/* Hidden Fields */}

      <input
        type="hidden"
        name="requirement_id"
        value={requirement.id}
      />

      {/* Submit */}
{resumeFile && (
  <p className="mt-4 text-sm">
    Resume Selected: {resumeFile.name}
  </p>
)}
      <button
        type="submit"
        disabled={loading}
        className="
        mt-10
        w-full
        rounded-2xl
        bg-black
        py-4
        text-lg
        font-semibold
        text-white
        transition
        hover:bg-zinc-800
        disabled:opacity-50
        "
      >

        {loading
          ? "Submitting..."
          : "Submit Candidate"}

      </button>

    </form>

  );

}

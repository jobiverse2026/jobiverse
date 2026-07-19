"use client";

import Link from "next/link";


type Props = {
  candidates: any[];
};



export default function CandidateTable({
  candidates,
}: Props) {


  return (

    <div
      className="
      overflow-hidden
      rounded-3xl
      border
      border-zinc-200
      bg-white
      "
    >


      <table
        className="
        w-full
        text-left
        "
      >


        <thead
          className="
          bg-zinc-100
          "
        >

          <tr>

            <th className="p-5">
              Candidate
            </th>


            <th className="p-5">
              Experience
            </th>


            <th className="p-5">
              Skills
            </th>


            <th className="p-5">
              Requirement
            </th>


            <th className="p-5">
              Status
            </th>


            <th className="p-5">
              Resume
            </th>


            <th className="p-5">
              Action
            </th>


          </tr>

        </thead>




        <tbody>


          {
            candidates.map((candidate) => (


              <tr
                key={candidate.id}
                className="
                border-t
                border-zinc-200
                "
              >



                {/* Candidate */}


                <td className="p-5">


                  <Link
                    href={`/recruiter/candidates/${candidate.id}`}
                    className="
                    font-semibold
                    hover:underline
                    "
                  >

                    {candidate.full_name}

                  </Link>


                  <p
                    className="
                    text-sm
                    text-zinc-500
                    "
                  >

                    {candidate.email}

                  </p>


                </td>





                {/* Experience */}


                <td className="p-5">

                  {candidate.total_experience}

                </td>





                {/* Skills */}


                <td className="p-5">

                  {candidate.primary_skills}

                </td>





                {/* Requirement */}


                <td className="p-5">

                  {
                    candidate.requirements?.job_title
                  }

                </td>





                {/* Status */}


                <td className="p-5">


                  <span
                    className="
                    rounded-full
                    bg-zinc-100
                    px-3
                    py-1
                    text-sm
                    "
                  >

                    {candidate.status}

                  </span>


                </td>





                {/* Resume */}


                <td className="p-5">


                  {
                    candidate.resume_url && (

                      <a
                        href={candidate.resume_url}
                        target="_blank"
                        className="
                        font-medium
                        underline
                        "
                      >

                        View Resume

                      </a>

                    )
                  }


                </td>





                {/* Action */}


                <td className="p-5">


                  <Link
                    href={`/recruiter/candidates/${candidate.id}`}
                    className="
                    rounded-xl
                    bg-black
                    px-4
                    py-2
                    text-sm
                    text-white
                    "
                  >

                    View Details

                  </Link>


                </td>



              </tr>


            ))
          }


        </tbody>


      </table>


    </div>

  );

}

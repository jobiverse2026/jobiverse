import { notFound } from "next/navigation";
import { CalendarDays, ExternalLink, UserRound, Video } from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import StatusUpdate from "@/components/recruiter/candidate/StatusUpdate";
import InterviewOutcomeForm from "@/components/recruiter/candidate/InterviewOutcomeForm";
import PlacementManager from "@/components/recruiter/candidate/PlacementManager";
import { firstRelation } from "@/lib/relations";


type Props = {
  params: Promise<{
    id: string;
  }>;
};



export default async function CandidateDetailPage({
  params,
}: Props) {


  const { id } = await params;


  const supabase = await createServerSupabaseClient();



  const {
    data: candidate
  } = await supabase
    .from("candidates")
    .select(`
      *,
      requirements(
        job_title
      ),
      interviews(
        id,
        interview_round,
        interview_date,
        interview_mode,
        meeting_link,
        interviewer_name,
        status,
        feedback,
        rating
      ),
      placements(
        id,
        status,
        offered_ctc,
        joining_date,
        replacement_end_date
      )
    `)
    .eq(
      "id",
      id
    )
    .single();



  if (!candidate) {

    notFound();

  }

  const { data: signedResume } = candidate.resume_path
    ? await supabase.storage
        .from("candidate-resumes")
        .createSignedUrl(candidate.resume_path, 3600)
    : { data: null };
  const placement = firstRelation(candidate.placements);



  return (

    <div
      className="
      mx-auto
      max-w-5xl
      space-y-8
      "
    >


      {/* Header */}

      <div>

        <h1
          className="
          text-4xl
          font-bold
          "
        >
          {candidate.full_name}
        </h1>


        <p className="
        mt-2
        text-zinc-500
        ">
          Candidate Profile
        </p>

      </div>



      {/* Status */}

      <div
        className="
        rounded-3xl
        border
        bg-white
        p-6
        "
      >

        <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-zinc-400">01 | Pipeline status</p>

        <p className="
        mb-3
        text-sm
        text-zinc-500
        ">
          Candidate Status
        </p>


        <StatusUpdate
          id={candidate.id}
          currentStatus={candidate.status}
        />


      </div>





      {/* Candidate Details */}


      <div aria-hidden="true" className="flex items-center gap-4"><span className="h-px flex-1 bg-zinc-200" /><span className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-400">Profile</span><span className="h-px flex-1 bg-zinc-200" /></div>

      <div
        className="
        rounded-3xl
        border
        bg-white
        p-8
        "
      >

        <p className="mb-6 text-xs font-bold uppercase tracking-[.18em] text-zinc-400">02 | Professional details</p>


        <div
          className="
          grid
          gap-6
          md:grid-cols-2
          "
        >



          <div>

            <p className="text-sm text-zinc-500">
              Email
            </p>

            <p className="font-semibold">
              {candidate.email}
            </p>

          </div>



          <div>

            <p className="text-sm text-zinc-500">
              Phone
            </p>

            <p className="font-semibold">
              {candidate.phone}
            </p>

          </div>




          <div>

            <p className="text-sm text-zinc-500">
              Experience
            </p>

            <p className="font-semibold">
              {candidate.total_experience}
            </p>

          </div>




          <div>

            <p className="text-sm text-zinc-500">
              Skills
            </p>

            <p className="font-semibold">
              {candidate.primary_skills}
            </p>

          </div>




          <div>

            <p className="text-sm text-zinc-500">
              Requirement
            </p>

            <p className="font-semibold">
              {candidate.requirements?.job_title}
            </p>

          </div>




          <div>

            <p className="text-sm text-zinc-500">
              Current Company
            </p>

            <p className="font-semibold">
              {candidate.current_company}
            </p>

          </div>



          <div>

            <p className="text-sm text-zinc-500">
              Current CTC
            </p>

            <p className="font-semibold">
              {candidate.current_ctc}
            </p>

          </div>




          <div>

            <p className="text-sm text-zinc-500">
              Expected CTC
            </p>

            <p className="font-semibold">
              {candidate.expected_ctc}
            </p>

          </div>



        </div>


      </div>





      <div aria-hidden="true" className="flex items-center gap-4"><span className="h-px flex-1 bg-zinc-200" /><span className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-400">Interviews</span><span className="h-px flex-1 bg-zinc-200" /></div>

      <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-zinc-400">03 | Client process</p><h2 className="mt-2 text-2xl font-bold">Interview Timeline</h2></div>
          <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-600">{candidate.interviews?.length ?? 0} scheduled</span>
        </div>
        {!candidate.interviews?.length ? (
          <p className="mt-6 rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500">No interview details available yet.</p>
        ) : (
          <div className="mt-7 space-y-4">
            {candidate.interviews.map((interview: any) => (
              <article key={interview.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="text-lg font-semibold text-zinc-950">{interview.interview_round}</p><p className="mt-2 flex items-center gap-2 text-sm text-zinc-600"><CalendarDays size={16} /> {new Date(interview.interview_date).toLocaleString("en-IN")}</p></div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold capitalize text-zinc-600 shadow-sm">{interview.status}</span>
                </div>
                <div className="mt-5 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2"><p className="flex items-center gap-2"><Video size={16} /> {interview.interview_mode || "Mode not specified"}</p><p className="flex items-center gap-2"><UserRound size={16} /> {interview.interviewer_name || "Interviewer not specified"}</p></div>
                {interview.meeting_link && <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-4 py-2.5 text-sm font-semibold text-white">Open Meeting Link <ExternalLink size={15} /></a>}
                {interview.feedback && <div className="mt-5 rounded-xl bg-white p-4 text-sm leading-6 text-zinc-700"><span className="font-semibold">Feedback:</span> {interview.feedback}{interview.rating && <span className="ml-2 font-semibold">| {interview.rating}/5</span>}</div>}
                <InterviewOutcomeForm interviewId={interview.id} candidateId={candidate.id} />
              </article>
            ))}
          </div>
        )}
      </section>

      {["Selected", "Offered", "Joined"].includes(candidate.status) && (
        <><div aria-hidden="true" className="flex items-center gap-4"><span className="h-px flex-1 bg-zinc-200" /><span className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-400">Offer & placement</span><span className="h-px flex-1 bg-zinc-200" /></div><PlacementManager candidateId={candidate.id} placement={placement} /></>
      )}

      <div aria-hidden="true" className="flex items-center gap-4"><span className="h-px flex-1 bg-zinc-200" /><span className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-400">Documents</span><span className="h-px flex-1 bg-zinc-200" /></div>

      {/* Resume */}


      {
        signedResume?.signedUrl && (

          <a
            href={signedResume.signedUrl}
            target="_blank"
            className="
            inline-block
            rounded-xl
            bg-black
            px-6
            py-3
            text-white
            "
          >

            Open Resume

          </a>

        )

      }



    </div>

  );

}





import { PageHeader } from "@/components/common/page-header";

import {
  FileText,
  Mic,
  BrainCircuit,
  GraduationCap,
  Target,
  Sparkles,
} from "lucide-react";


const services = [
  {
    title: "Professional CV & Resume",
    description:
      "Build an ATS-ready, achievement-led CV that positions your experience for stronger roles, transitions and leadership opportunities.",
    icon: FileText,
    id: "professional-resume",
  },

  {
    title: "LinkedIn Optimization",
    description:
      "Improve your professional presence and build a profile that attracts recruiters.",
    icon: Sparkles,
  },

  {
    title: "Interview Preparation",
    description:
      "Prepare for interviews with structured guidance, practice sessions and expert feedback.",
    icon: Mic,
  },

  {
    title: "AI Career Tools",
    description:
      "Use intelligent tools for resume analysis, job matching and career improvement.",
    icon: BrainCircuit,
  },

  {
    title: "Career Guidance",
    description:
      "Get personalized support for career decisions, skills and professional growth.",
    icon: GraduationCap,
  },

  {
    title: "Career Roadmap",
    description:
      "Plan your next career milestone with a clear professional roadmap.",
    icon: Target,
  },
];


export default function CareerServicesPage() {

  return (

    <main className="min-h-screen bg-white text-black">



      <PageHeader

        eyebrow="Career Services"

        title="Build A Career That Moves Forward."

        description="
        Professional guidance, tools and resources designed to help
        candidates unlock better career opportunities.
        "

      />



      <section className="py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">


            {services.map((service) => {

              const Icon = service.icon;


              return (

                <div

                  key={service.title}
                  id={service.id}

                  className="
                  rounded-3xl
                  border
                  border-zinc-200
                  p-8
                  transition
                  hover:-translate-y-2
                  hover:shadow-xl
                  "

                >

                  <div
                    className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-black
                    text-white
                    "
                  >

                    <Icon className="h-7 w-7" />

                  </div>



                  <h3 className="mt-6 text-xl font-semibold">

                    {service.title}

                  </h3>



                  <p className="mt-4 leading-7 text-zinc-600">

                    {service.description}

                  </p>


                </div>

              );

            })}


          </div>


        </div>

      </section>





      <section className="border-t border-zinc-200 bg-zinc-50 py-24">

        <div className="mx-auto max-w-5xl px-6 text-center">


          <h2 className="text-4xl font-bold">

            Because Finding A Job Is Only The Beginning.

          </h2>


          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-600">

            JobiVerse helps candidates improve their profiles,
            prepare better and build long-term careers.

          </p>


        </div>

      </section>





      <section className="py-24">

        <div className="mx-auto max-w-6xl px-6 lg:px-8">


          <div
            className="
            rounded-3xl
            bg-black
            p-10
            text-white
            md:p-16
            "
          >

            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">

              Future Technology

            </p>


            <h2 className="mt-5 text-4xl font-bold">

              AI Powered Career Growth

            </h2>


            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-400">

              Future JobiVerse tools will include AI Resume Analysis,
              Job Match Score, Interview Preparation and personalized
              career recommendations.

            </p>


          </div>


        </div>

      </section>





      <section className="border-t border-zinc-200 py-20 text-center">


        <h2 className="text-4xl font-bold">

          Ready To Upgrade Your Career?

        </h2>


        <p className="mt-5 text-zinc-600">

          Start building a stronger professional future with JobiVerse.

        </p>


      </section>





    </main>

  );

}

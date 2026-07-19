import { PageHeader } from "@/components/common/page-header";
import { ExploreServicesSection } from "@/components/marketplace/explore-services-section";
import { ActiveJobsGateway } from "@/components/careers/active-jobs-gateway";

import {
  Search,
  FileText,
  Sparkles,
  TrendingUp,
  BriefcaseBusiness,
  UserRoundCheck,
} from "lucide-react";


const candidateFeatures = [
  {
    title: "Discover Opportunities",
    description:
      "Explore relevant career opportunities across IT and Non-IT industries.",
    icon: Search,
  },

  {
    title: "Resume Enhancement",
    description:
      "Build professional resumes designed to highlight your skills and experience.",
    icon: FileText,
  },

  {
    title: "AI Career Tools",
    description:
      "Access future-ready AI tools for resume analysis, job matching and career growth.",
    icon: Sparkles,
  },

  {
    title: "Career Guidance",
    description:
      "Get support to make better career decisions and improve your professional journey.",
    icon: TrendingUp,
  },

  {
    title: "Premium Opportunities",
    description:
      "Connect with organizations searching for skilled professionals.",
    icon: BriefcaseBusiness,
  },

  {
    title: "Interview & Transition Support",
    description:
      "Prepare for interviews, role transitions and your next professional move.",
    icon: UserRoundCheck,
  },
];



export default function CandidatesPage() {

  return (

    <main className="min-h-screen bg-white text-black">





      <PageHeader

        eyebrow="For Candidates"

        title="From Beginners To Bosses.
Your Career Journey Starts Here."

        description="
        JobiVerse helps professionals discover opportunities,
        improve their profiles and build successful careers.
        "

      />






      {/* Features */}

      <section id="career-overview" className="py-24">


        <div className="mx-auto max-w-7xl px-6 lg:px-8">


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">


            {candidateFeatures.map((item)=>{


              const Icon=item.icon;


              return (

                <div

                  key={item.title}

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

                    <Icon className="h-7 w-7"/>

                  </div>




                  <h3 className="mt-6 text-xl font-semibold">

                    {item.title}

                  </h3>




                  <p className="mt-4 leading-7 text-zinc-600">

                    {item.description}

                  </p>



                </div>

              );


            })}


          </div>


        </div>


      </section>







      <ActiveJobsGateway audience="professional" />

      {/* Career Journey */}

      <section id="career-services" className="border-t border-zinc-200 bg-zinc-50 py-24">


        <div className="mx-auto max-w-6xl px-6 lg:px-8">


          <div className="text-center">


            <h2 className="text-4xl font-bold">

              More Than A Job Search.

              <br />

              A Career Partner.

            </h2>


            <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-600">


              Whether you are starting your career, changing industries,
              or looking for your next leadership opportunity,
              JobiVerse supports every stage of your journey.


            </p>


          </div>





          <div className="mt-12 grid gap-6 md:grid-cols-3">


            <div className="rounded-3xl border border-zinc-200 bg-white p-8">


              <h3 className="text-xl font-semibold">

                Beginners

              </h3>


              <p className="mt-3 text-zinc-600">

                Guidance and opportunities to start your professional journey.

              </p>


            </div>




            <div className="rounded-3xl border border-zinc-200 bg-white p-8">


              <h3 className="text-xl font-semibold">

                Professionals

              </h3>


              <p className="mt-3 text-zinc-600">

                Better opportunities aligned with your experience and goals.

              </p>


            </div>




            <div className="rounded-3xl border border-zinc-200 bg-white p-8">


              <h3 className="text-xl font-semibold">

                Leaders

              </h3>


              <p className="mt-3 text-zinc-600">

                Executive opportunities for experienced professionals.

              </p>


            </div>


          </div>


        </div>


      </section>







      <ExploreServicesSection audience="professional" limit={3} />

      {/* Candidate CTA */}

      <section id="get-started" className="bg-black py-24 text-center text-white">


        <div className="mx-auto max-w-3xl px-6">


          <h2 className="text-4xl font-bold">

            Ready For Your Next Opportunity?

          </h2>


          <p className="mt-5 text-zinc-400">

            Create your profile and let opportunities find you.

          </p>



          <button
            className="
            mt-8
            rounded-xl
            bg-white
            px-8
            py-4
            font-semibold
            text-black
            transition
            hover:bg-zinc-200
            "
          >

            Create Profile

          </button>


        </div>


      </section>






    </main>

  );

}

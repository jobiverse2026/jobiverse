import { PageHeader } from "@/components/common/page-header";
import { PageSectionIndex } from "@/components/common/page-section-index";
import { ExploreServicesSection } from "@/components/marketplace/explore-services-section";

import Link from "next/link";

import {
  Search,
  Users,
  ShieldCheck,
  Clock3,
  Target,
  BriefcaseBusiness,
  Code2,
  UserCheck,
} from "lucide-react";


const benefits = [
  {
    title: "Access Quality Talent",
    description:
      "Connect with skilled professionals across IT and Non-IT domains through our recruitment network.",
    icon: Users,
  },

  {
    title: "Dedicated Talent Search",
    description:
      "Our team understands your requirements and identifies candidates aligned with your business needs.",
    icon: Search,
  },

  {
    title: "Faster Hiring Process",
    description:
      "Reduce hiring timelines with structured sourcing, screening and candidate engagement.",
    icon: Clock3,
  },

  {
    title: "Industry Expertise",
    description:
      "Benefit from recruitment experience across multiple industries and business functions.",
    icon: Target,
  },

  {
    title: "Reliable Partnership",
    description:
      "A transparent approach focused on long-term relationships and hiring success.",
    icon: ShieldCheck,
  },

  {
    title: "Flexible Hiring Solutions",
    description:
      "Recruitment support designed for startups, growing businesses and enterprises.",
    icon: BriefcaseBusiness,
  },
];

const recruitmentServices = [
  { title: "IT Recruitment", description: "Technology hiring across software, cloud, data, AI, QA and cybersecurity.", icon: Code2 },
  { title: "Non-IT Recruitment", description: "Hiring across sales, operations, finance, marketing, healthcare and support functions.", icon: Users },
  { title: "Executive Search", description: "Focused search for CXOs, directors, senior managers and specialist leaders.", icon: Search },
  { title: "End-to-End Hiring", description: "Sourcing, screening, coordination, offer support and joining assistance.", icon: UserCheck },
  { title: "Talent Discovery", description: "Passive sourcing, market mapping and access to hidden professional networks.", icon: Target },
  { title: "Flexible Hiring Support", description: "Recruitment solutions aligned to startup, SME and enterprise requirements.", icon: BriefcaseBusiness },
];



export default function EmployersPage() {


  return (

    <main className="min-h-screen bg-white text-black">





      <PageHeader

        eyebrow="For Employers"

        title="Build Your Team With The Right Talent."

        description="
        JobiVerse helps organizations hire exceptional professionals
        through recruitment expertise, strong networks and technology.
        "

      />

      <PageSectionIndex items={[{label:"Recruitment services",href:"#employer-recruitment-services"},{label:"Hiring advantages",href:"#hiring-advantages"},{label:"Hiring process",href:"#recruitment-solutions"},{label:"Submit requirement",href:"#submit-requirement"},{label:"Hiring consultation",href:"/consultations"},{label:"Employer plans",href:"/plans"}]}/>

      <section id="employer-recruitment-services" className="bg-[#f6f6f3] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Recruitment services</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">The right hiring support for every critical role.</h2><p className="mt-5 text-lg leading-8 text-zinc-600">Recruitment-only solutions now live here, together with the employer journey and hiring process.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{recruitmentServices.map(({title,description,icon:Icon},index)=><article key={title} className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white"><Icon size={22}/></span><span className="text-xs font-bold text-zinc-300">0{index+1}</span></div><h3 className="mt-7 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-zinc-600">{description}</p></article>)}</div>
        </div>
      </section>






      {/* Benefits */}

      <section id="hiring-advantages" className="py-24">


        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mb-12 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Why JobiVerse</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Hiring advantages built around your business.</h2><p className="mt-5 text-lg leading-8 text-zinc-600">A reliable recruitment partnership focused on talent quality, speed and long-term hiring success.</p></div>


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">


            {benefits.map((item)=>{


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







      {/* Hiring Process */}

      <section id="recruitment-solutions" className="border-t border-zinc-200 bg-zinc-50 py-24">


        <div className="mx-auto max-w-6xl px-6 lg:px-8">


          <div className="text-center">


            <h2 className="text-4xl font-bold">

              Our Hiring Process

            </h2>


            <p className="mt-5 text-zinc-600">

              A simple and effective approach to finding the right people.

            </p>


          </div>




          <div className="mt-12 grid gap-6 md:grid-cols-4">


            <div className="rounded-3xl bg-white border border-zinc-200 p-6">

              <p className="font-bold text-2xl">
                01
              </p>

              <h3 className="mt-4 font-semibold">
                Understand
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                We understand your role, culture and requirements.
              </p>

            </div>



            <div className="rounded-3xl bg-white border border-zinc-200 p-6">

              <p className="font-bold text-2xl">
                02
              </p>

              <h3 className="mt-4 font-semibold">
                Source
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                We identify relevant candidates from our network.
              </p>

            </div>




            <div className="rounded-3xl bg-white border border-zinc-200 p-6">

              <p className="font-bold text-2xl">
                03
              </p>

              <h3 className="mt-4 font-semibold">
                Evaluate
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                Candidates are screened based on requirements.
              </p>

            </div>





            <div className="rounded-3xl bg-white border border-zinc-200 p-6">

              <p className="font-bold text-2xl">
                04
              </p>

              <h3 className="mt-4 font-semibold">
                Hire
              </h3>

              <p className="mt-2 text-sm text-zinc-600">
                Connect with talent ready to create impact.
              </p>

            </div>


          </div>


        </div>


      </section>







      <ExploreServicesSection audience="employer" limit={3} />

      {/* Employer CTA */}

      <section id="submit-requirement" className="bg-black py-24 text-center text-white">


        <div className="mx-auto max-w-3xl px-6">


          <h2 className="text-4xl font-bold">

            Ready To Find Your Next Great Hire?

          </h2>


          <p className="mt-5 text-zinc-400">

            Share your requirement and our team will connect with you.

          </p>



          <Link
  href="/employers/requirements"
  className="
  mt-8
  inline-flex
  items-center
  justify-center
  rounded-xl
  bg-white
  px-8
  py-4
  font-semibold
  text-black
  transition-all
  duration-300
  hover:-translate-y-1
  hover:bg-zinc-200
  hover:shadow-xl
"
>
  Submit Hiring Requirement
</Link>


        </div>


      </section>






    </main>

  );

}

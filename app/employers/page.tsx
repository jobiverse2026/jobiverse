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
  LockKeyhole,
  UserCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  FileBarChart2,
  MailPlus,
  MessageSquareText,
  Sparkles,
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

const portalFeatures = [
  {
    title: "Master Employer Workspace",
    description: "One verified company owner can manage company data, seat limits, team access and full hiring visibility.",
    icon: Building2,
  },
  {
    title: "Employer & Recruiter Seats",
    description: "Invite exact employer or recruiter emails, assign seat limits and control who can access your company workspace.",
    icon: MailPlus,
  },
  {
    title: "Requirement Command Center",
    description: "Create requirements, edit details, publish jobs, assign recruiters and track role progress from one place.",
    icon: ClipboardList,
  },
  {
    title: "Unified Candidate Pipeline",
    description: "See recruiter-submitted, JobiVerse-submitted and direct job-portal applicants together with source filters.",
    icon: Users,
  },
  {
    title: "Interview Calendar & Status Flow",
    description: "Schedule interviews, view upcoming meetings and move candidates through interview, offer and joining stages.",
    icon: CalendarDays,
  },
  {
    title: "Reports & Performance",
    description: "Download recruiter reports, requirement progress reports and date-wise performance summaries with totals.",
    icon: FileBarChart2,
  },
  {
    title: "Paid Talent Search",
    description: "Unlock search access for open-to-work JobiVerse cards with skill, location, role and notice-period filters.",
    icon: LockKeyhole,
  },
  {
    title: "Messages & Notifications",
    description: "Get relevant alerts for assignments, candidates, interviews, feedback and employer workflow changes.",
    icon: MessageSquareText,
  },
];

const portalFlow = [
  "JobiVerse creates or verifies your company workspace.",
  "Your Master Employer receives controlled access and seat limits.",
  "You invite team members by exact email and assign recruiter seats.",
  "Create requirements, publish jobs or assign roles to JobiVerse.",
  "Track candidates, interviews, reports and hiring outcomes securely.",
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

      <PageSectionIndex items={[{label:"Recruitment services",href:"#employer-recruitment-services"},{label:"Portal preview",href:"#employer-portal-preview"},{label:"Talent Search",href:"#talent-search"},{label:"Hiring advantages",href:"#hiring-advantages"},{label:"Hiring process",href:"#recruitment-solutions"},{label:"Submit requirement",href:"#submit-requirement"},{label:"Hiring consultation",href:"/consultations"},{label:"Employer plans",href:"/plans"}]}/>

      <section id="employer-recruitment-services" className="bg-[#f6f6f3] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Recruitment services</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">The right hiring support for every critical role.</h2><p className="mt-5 text-lg leading-8 text-zinc-600">Recruitment-only solutions now live here, together with the employer journey and hiring process.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{recruitmentServices.map(({title,description,icon:Icon},index)=><article key={title} className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white"><Icon size={22}/></span><span className="text-xs font-bold text-zinc-300">0{index+1}</span></div><h3 className="mt-7 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-zinc-600">{description}</p></article>)}</div>
        </div>
      </section>

      <section id="employer-portal-preview" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-[3rem] border border-zinc-200 bg-[#f6f6f3] shadow-2xl">
            <div className="grid gap-0 lg:grid-cols-[.86fr_1.14fr]">
              <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white sm:p-12">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div className="absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-zinc-300">
                  <LockKeyhole size={15} /> Access locked, benefits visible
                </span>
                <h2 className="mt-8 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">
                  See what unlocks inside the Employer Portal.
                </h2>
                <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300">
                  Employer access is intentionally controlled so company data, candidate details and hiring activity stay protected. But the value is transparent: JobiVerse gives employers a complete hiring workspace, not just a contact form.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/contact" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-zinc-950">
                    Request employer access <Sparkles size={17} />
                  </Link>
                  <Link href="/pricing" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-semibold text-white">
                    View access pricing
                  </Link>
                </div>
                <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[.06] p-6">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">How access works</p>
                  <div className="mt-5 space-y-4">
                    {portalFlow.map((step, index) => (
                      <div key={step} className="flex gap-3 text-sm leading-6 text-zinc-300">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-zinc-950">{index + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="grid gap-4 sm:grid-cols-2">
                  {portalFeatures.map(({ title, description, icon: Icon }) => (
                    <article key={title} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white">
                        <Icon size={21} />
                      </span>
                      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                      <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-5 rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
                  <p className="text-sm font-semibold text-amber-950">Commercial protection note</p>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    Direct job-portal candidate joining is tracked with JobiVerse protection terms. Hiring through the JobiVerse team remains a separate managed recruitment partnership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="talent-search" className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Paid talent discovery</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Search candidates like a premium talent database.</h2>
            <p className="mt-5 text-lg leading-8 text-zinc-600">
              Employers can discover JobiVerse candidates who have actively opted into visibility. Search by skills, location, role level, industry, work mode, salary range and notice period — while JobiVerse protects candidate privacy and coordinates the hiring flow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/employers/talent-search" className="inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-4 font-semibold text-white">Preview Talent Search<Search size={17}/></Link>
              <Link href="/plans" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-6 py-4 font-semibold">Request paid access<LockKeyhole size={17}/></Link>
            </div>
          </div>
          <div className="rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-6 text-white shadow-2xl sm:p-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-500">Talent pool</p><h3 className="mt-2 text-3xl font-semibold">Consent-first candidate search</h3></div>
                <Search className="text-zinc-500" size={42}/>
              </div>
              <div className="mt-7 grid gap-3">
                {["Open-to-work profiles only","Skill, role and location filters","Salary and notice-period matching","Full contact flow protected by JobiVerse"].map((item)=><div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm"><ShieldCheck size={16}/>{item}</div>)}
              </div>
            </div>
          </div>
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

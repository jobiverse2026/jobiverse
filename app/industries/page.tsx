import { PageHeader } from "@/components/common/page-header";

import {
  Code2,
  Landmark,
  HeartPulse,
  Factory,
  ShoppingCart,
  GraduationCap,
  Rocket,
  Cloud,
} from "lucide-react";


const industries = [
  {
    title: "Technology & IT",
    description:
      "Software development, cloud, AI, cybersecurity, data and technology professionals.",
    icon: Code2,
  },

  {
    title: "BFSI",
    description:
      "Banking, financial services, insurance and fintech hiring solutions.",
    icon: Landmark,
  },

  {
    title: "Healthcare & Pharma",
    description:
      "Connecting healthcare organizations with skilled professionals.",
    icon: HeartPulse,
  },

  {
    title: "Manufacturing",
    description:
      "Engineering, operations and industrial workforce solutions.",
    icon: Factory,
  },

  {
    title: "Retail & E-commerce",
    description:
      "Supporting consumer brands and digital businesses with talent acquisition.",
    icon: ShoppingCart,
  },

  {
    title: "Education & EdTech",
    description:
      "Helping education companies build strong teams.",
    icon: GraduationCap,
  },

  {
    title: "Startups",
    description:
      "Fast and flexible hiring support for growing businesses.",
    icon: Rocket,
  },

  {
    title: "SaaS & Emerging Tech",
    description:
      "Specialized hiring for modern technology companies.",
    icon: Cloud,
  },
];



export default function IndustriesPage() {


  return (

    <main className="min-h-screen bg-white text-black">





      <PageHeader

        eyebrow="Industries"

        title="Expertise Across Diverse Industries."

        description="
        JobiVerse helps businesses across industries discover
        exceptional professionals through specialized hiring solutions.
        "

      />





      <section className="py-24">


        <div className="mx-auto max-w-7xl px-6 lg:px-8">


          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">


            {industries.map((industry)=>{


              const Icon = industry.icon;


              return (

                <div

                  key={industry.title}

                  className="
                  group
                  rounded-3xl
                  border
                  border-zinc-200
                  bg-white
                  p-7
                  transition
                  hover:-translate-y-2
                  hover:shadow-xl
                  "

                >


                  <div
                    className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-black
                    text-white
                    transition
                    group-hover:scale-110
                    "
                  >

                    <Icon className="h-6 w-6"/>

                  </div>




                  <h3 className="mt-6 text-xl font-semibold">

                    {industry.title}

                  </h3>




                  <p className="mt-3 text-sm leading-6 text-zinc-600">

                    {industry.description}

                  </p>



                </div>

              );


            })}


          </div>


        </div>


      </section>







      {/* Why Industry Expertise */}

      <section className="border-t border-zinc-200 bg-zinc-50 py-24">


        <div className="mx-auto max-w-5xl px-6 text-center">


          <h2 className="text-4xl font-bold">

            Why Industry Knowledge Matters

          </h2>


          <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-600">


            Every industry has different challenges, skill requirements
            and hiring expectations. Our approach combines market
            understanding with recruitment expertise to identify the
            right professionals faster.


          </p>


        </div>


      </section>







      {/* CTA */}

      <section className="bg-black py-20 text-center text-white">


        <div className="mx-auto max-w-3xl px-6">


          <h2 className="text-4xl font-bold">

            Looking For Industry-Specific Talent?

          </h2>


          <p className="mt-5 text-zinc-400">

            Connect with JobiVerse and build teams that drive growth.

          </p>


        </div>


      </section>







    </main>

  );

}

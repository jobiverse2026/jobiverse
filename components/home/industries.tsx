"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Landmark,
  HeartPulse,
  Factory,
  ShoppingBag,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";


const industries = [
  {
    title: "Technology",
    description:
      "Software, SaaS, AI, IT services and emerging technology companies building the future.",
    icon: Code2,
  },

  {
    title: "BFSI",
    description:
      "Banking, fintech, financial services and insurance organizations.",
    icon: Landmark,
  },

  {
    title: "Healthcare",
    description:
      "Healthcare providers, pharma companies and health technology innovators.",
    icon: HeartPulse,
  },

  {
    title: "Manufacturing",
    description:
      "Engineering, operations, production and industrial organizations.",
    icon: Factory,
  },

  {
    title: "Retail & E-commerce",
    description:
      "Consumer brands, marketplaces and digital commerce businesses.",
    icon: ShoppingBag,
  },

  {
    title: "Education",
    description:
      "EdTech platforms, learning organizations and education innovators.",
    icon: GraduationCap,
  },
];



export function Industries() {


  return (

    <section
      className="
      relative
      jv-orbit-divider
      overflow-hidden
      border-t
      border-zinc-200
      bg-white/70
      py-32
      "
    >



      {/* Background */}

      <div
        className="
        absolute
        bottom-0
        left-1/2
        h-72
        w-72
        -translate-x-1/2
        rounded-full
        bg-zinc-100
        blur-3xl
        "
      />




      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">





        {/* Heading */}

        <motion.div

          initial={{
            opacity:0,
            y:30,
          }}

          whileInView={{
            opacity:1,
            y:0,
          }}

          viewport={{
            once:true,
          }}

          transition={{
            duration:.6,
          }}


          className="
          mx-auto
          max-w-3xl
          text-center
          "

        >


          <p
            className="
            text-sm
            font-semibold
            uppercase
            tracking-[0.35em]
            text-zinc-500
            "
          >

            INDUSTRY NETWORK

          </p>





          <h2
            className="
            mt-6
            text-4xl
            font-bold
            tracking-tight
            text-black
            sm:text-6xl
            "
          >

            Talent Across

            <br />

            Every Industry.

          </h2>





          <p
            className="
            mt-6
            text-lg
            leading-8
            text-zinc-600
            "
          >

            Connecting businesses with skilled professionals
            across industries, functions and growth stages.

          </p>



        </motion.div>










        {/* Cards */}

        <div
          className="
          mt-20
          grid
          gap-6
          sm:grid-cols-2
          lg:grid-cols-3
          "
        >



          {industries.map((industry,index)=>{


            const Icon=industry.icon;



            return (


              <motion.div


                key={industry.title}


                initial={{
                  opacity:0,
                  y:40,
                }}


                whileInView={{
                  opacity:1,
                  y:0,
                }}


                viewport={{
                  once:true,
                }}


                transition={{
                  delay:index*.08,
                }}


                whileHover={{
                  y:-10,
                }}


                className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-zinc-200
                bg-zinc-50
                p-8
                transition-all
                hover:bg-white
                hover:shadow-2xl
                "

              >




                {/* Hover layer */}

                <div

                  className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-zinc-100
                  to-transparent
                  opacity-0
                  transition
                  group-hover:opacity-100
                  "

                />





                <div className="relative">



                  <div
                    className="
                    flex
                    items-center
                    justify-between
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
                      transition
                      group-hover:scale-110
                      "
                    >

                      <Icon className="h-7 w-7"/>


                    </div>





                    <ArrowUpRight

                      className="
                      h-5
                      w-5
                      opacity-0
                      transition
                      group-hover:opacity-100
                      "

                    />



                  </div>







                  <h3
                    className="
                    mt-7
                    text-xl
                    font-semibold
                    text-black
                    "
                  >

                    {industry.title}


                  </h3>







                  <p
                    className="
                    mt-4
                    text-sm
                    leading-7
                    text-zinc-600
                    "
                  >

                    {industry.description}


                  </p>



                </div>



              </motion.div>


            );


          })}



        </div>




      </div>



    </section>


  );

}

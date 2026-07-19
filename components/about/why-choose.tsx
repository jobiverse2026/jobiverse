"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Users,
  BrainCircuit,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";


const reasons = [
  {
    title: "Deep Recruitment Expertise",
    description:
      "Years of recruitment experience helping businesses identify, attract and hire the right talent across industries.",
    icon: Users,
  },

  {
    title: "Strong Talent Network",
    description:
      "Access to a growing professional ecosystem that enables faster sourcing and better candidate discovery.",
    icon: Target,
  },

  {
    title: "Technology Driven Approach",
    description:
      "Combining human expertise with modern technology to create smarter hiring experiences.",
    icon: BrainCircuit,
  },

  {
    title: "Quality Over Quantity",
    description:
      "Focused approach to understanding requirements and delivering candidates who create real business impact.",
    icon: ShieldCheck,
  },

  {
    title: "Faster Hiring Process",
    description:
      "Streamlined recruitment workflows designed to reduce hiring timelines without compromising quality.",
    icon: Zap,
  },

  {
    title: "Long-Term Partnerships",
    description:
      "Building relationships with companies and professionals beyond a single hiring requirement.",
    icon: TrendingUp,
  },
];


export function WhyChoose() {

  return (

    <section className="border-t border-zinc-200 bg-zinc-50 py-28">


      <div className="mx-auto max-w-7xl px-6 lg:px-8">



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

          className="mx-auto max-w-3xl text-center"

        >


          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            WHY JOBIVERSE
          </p>



          <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">

            Why Companies And
            <br />
            Candidates Choose Us.

          </h2>



          <p className="mt-6 text-lg leading-8 text-zinc-600">

            More than recruitment. We combine experience,
            technology and relationships to create better
            hiring outcomes.

          </p>


        </motion.div>





        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">


          {reasons.map((item,index)=>{


            const Icon = item.icon;


            return (

              <motion.div

                key={item.title}

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
                  delay:index*0.08,
                }}

                whileHover={{
                  y:-8,
                }}


                className="
                group
                rounded-[32px]
                border
                border-zinc-200
                bg-white
                p-8
                transition
                hover:shadow-2xl
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




                <h3 className="mt-7 text-xl font-bold">

                  {item.title}

                </h3>




                <p className="mt-4 leading-7 text-zinc-600">

                  {item.description}

                </p>



              </motion.div>

            );


          })}


        </div>


      </div>


    </section>

  );

}
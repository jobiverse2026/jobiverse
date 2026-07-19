"use client";

import { motion } from "framer-motion";

import {
  Network,
  Target,
  Zap,
  ShieldCheck,
} from "lucide-react";



const benefits = [

  {
    title: "Strong Talent Network",
    description:
      "Access a growing network of professionals across technology, business functions and multiple industries.",
    icon: Network,
  },


  {
    title: "Quality Focused Hiring",
    description:
      "We focus on relevant talent matching, ensuring companies receive candidates aligned with their requirements.",
    icon: Target,
  },


  {
    title: "Faster Hiring Cycles",
    description:
      "Our structured approach helps organizations reduce hiring timelines and improve recruitment efficiency.",
    icon: Zap,
  },


  {
    title: "Trusted Recruitment Partner",
    description:
      "From requirement understanding to onboarding support, we work as an extension of your hiring team.",
    icon: ShieldCheck,
  },

];





export function CandidateBenefits() {


  return (


    <section className="py-28">


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

          className="mx-auto max-w-3xl text-center"

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

            FOR EMPLOYERS

          </p>





          <h2
            className="
            mt-6
            text-4xl
            font-bold
            tracking-tight
            sm:text-5xl
            "
          >

            Why Companies
            <br />
            Choose JobiVerse.

          </h2>






          <p
            className="
            mt-6
            text-lg
            leading-8
            text-zinc-600
            "
          >

            We combine recruitment expertise, professional networks
            and modern hiring solutions to help businesses build
            exceptional teams.

          </p>



        </motion.div>








        <div
          className="
          mt-16
          grid
          gap-6
          md:grid-cols-2
          "
        >





          {benefits.map((item,index)=>{


            const Icon=item.icon;



            return (



              <motion.div


                key={item.title}


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
                  delay:index*0.1,
                }}




                whileHover={{
                  y:-8,
                }}




                className="
                rounded-3xl
                border
                border-zinc-200
                bg-white
                p-8
                transition
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







                <h3
                  className="
                  mt-6
                  text-2xl
                  font-bold
                  "
                >

                  {item.title}

                </h3>







                <p
                  className="
                  mt-4
                  leading-7
                  text-zinc-600
                  "
                >

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
"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Globe2,
  ShieldCheck,
  Target,
  Handshake,
  ArrowUpRight,
} from "lucide-react";


const trustStats = [
  {
    number: "35K+",
    title: "Professional Network",
    description:
      "Access to a growing ecosystem of professionals across multiple industries and functions.",
    icon: Users,
  },

  {
    number: "10+",
    title: "Global Exposure",
    description:
      "Recruitment experience supporting talent requirements across international markets.",
    icon: Globe2,
  },

  {
    number: "IT + Non IT",
    title: "Industry Expertise",
    description:
      "Helping organizations hire across technology, business and operational functions.",
    icon: Building2,
  },
];


const trustPillars = [
  {
    title: "Quality First Approach",
    description:
      "Understanding business requirements deeply to identify candidates who create long-term value.",
    icon: ShieldCheck,
  },

  {
    title: "Result Driven Hiring",
    description:
      "Combining recruitment expertise and technology to improve hiring efficiency.",
    icon: Target,
  },

  {
    title: "Long-Term Partnerships",
    description:
      "Building relationships with companies and professionals beyond a single hiring cycle.",
    icon: Handshake,
  },
];



export function Trust() {


  return (

    <section
      className="
      relative
      jv-orbit-divider
      border-t
      border-zinc-200
      bg-zinc-50/70
      py-32
      "
    >



      <div className="mx-auto max-w-7xl px-6 lg:px-8">





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

            TRUST & IMPACT

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

            Built On Experience.

            <br />

            Powered By Relationships.

          </h2>






          <p
            className="
            mt-6
            text-lg
            leading-8
            text-zinc-600
            "
          >

            Creating meaningful connections between organizations
            and professionals through expertise, trust and technology.

          </p>



        </motion.div>










        {/* Stats */}

        <div
          className="
          mt-20
          grid
          gap-6
          md:grid-cols-3
          "
        >



          {trustStats.map((item,index)=>{


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
                  delay:index*.1,
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
                shadow-sm
                transition
                hover:shadow-xl
                "

              >



                <Icon className="h-8 w-8 text-black"/>



                <h3
                  className="
                  mt-7
                  text-4xl
                  font-bold
                  text-black
                  "
                >

                  {item.number}

                </h3>





                <h4
                  className="
                  mt-3
                  text-lg
                  font-semibold
                  "
                >

                  {item.title}

                </h4>





                <p
                  className="
                  mt-3
                  text-sm
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









        {/* Partnership */}

        <div
          className="
          mt-20
          grid
          gap-6
          md:grid-cols-3
          "
        >




          {trustPillars.map((item,index)=>{


            const Icon=item.icon;



            return (

              <motion.div


                key={item.title}


                initial={{
                  opacity:0,
                  y:20,
                }}


                whileInView={{
                  opacity:1,
                  y:0,
                }}


                viewport={{
                  once:true,
                }}


                transition={{
                  delay:index*.1,
                }}



                className="
                group
                rounded-3xl
                border
                border-zinc-200
                bg-white
                p-8
                transition
                hover:shadow-xl
                "

              >


                <div className="flex justify-between">


                  <Icon className="h-7 w-7"/>


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





                <h3 className="mt-6 text-xl font-semibold">

                  {item.title}

                </h3>




                <p
                  className="
                  mt-3
                  text-sm
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

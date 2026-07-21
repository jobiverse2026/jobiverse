"use client";

import { motion } from "framer-motion";
import {
  Search,
  UsersRound,
  BrainCircuit,
  Handshake,
  ArrowUpRight,
  GraduationCap,
  Palette,
} from "lucide-react";


const services = [
  {
    number: "01",
    title: "Hiring & Talent Systems",
    description:
      "Recruitment support, employer workspaces, requirement tracking, recruiter collaboration and protected hiring workflows.",
    icon: Search,
  },

  {
    number: "02",
    title: "Career Growth Tools",
    description:
      "JobiVerse Cards, profile completeness, confidence scoring, application tracking and guidance for better career moves.",
    icon: UsersRound,
  },

  {
    number: "03",
    title: "Student & Fresher Launchpad",
    description:
      "Resume support, first-job preparation, campus partnerships, events and practical readiness for early careers.",
    icon: GraduationCap,
  },

  {
    number: "04",
    title: "Creator Marketplace",
    description:
      "A trusted space for experts to offer career services, editable CV templates, interview help and professional support.",
    icon: Palette,
  },

  {
    number: "05",
    title: "JobiVerse Personal",
    description:
      "Direct JobiVerse services for resume building, hiring consultation, candidate screening and structured career support.",
    icon: Handshake,
  },

  {
    number: "06",
    title: "Future AI Intelligence",
    description:
      "AI resume analysis, interview preparation, matching intelligence and career coaching are ready to activate when paid AI is enabled.",
    icon: BrainCircuit,
  },
];



export function Services() {


  return (

    <section
      className="
      relative
      jv-orbit-divider
      overflow-hidden
      border-t
      border-zinc-200
      bg-zinc-50/70
      py-32
      "
    >



      <div
        className="
        absolute
        left-0
        top-20
        h-72
        w-72
        rounded-full
        bg-zinc-200
        blur-3xl
        opacity-40
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

            WHAT LIVES INSIDE

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

            More Than Recruitment.

            <br />

            A Work Universe.

          </h2>





          <p
            className="
            mt-6
            text-lg
            leading-8
            text-zinc-600
            "
          >

            JobiVerse connects the pieces that usually stay separate:
            hiring, jobs, career readiness, creator services, reports,
            marketplace support and future AI intelligence.

          </p>



        </motion.div>










        {/* Timeline */}

        <div
          className="
          relative
          mx-auto
          mt-24
          max-w-4xl
          "
        >



          {/* Vertical line */}

          <div
            className="
            absolute
            left-8
            top-0
            hidden
            h-full
            w-px
            bg-zinc-300
            md:block
            "
          />





          <div className="space-y-10">



            {services.map((service,index)=>{


              const Icon=service.icon;



              return (

                <motion.div


                  key={service.number}


                  initial={{
                    opacity:0,
                    x:-40,
                  }}


                  whileInView={{
                    opacity:1,
                    x:0,
                  }}


                  viewport={{
                    once:true,
                  }}


                  transition={{
                    duration:.5,
                    delay:index*.1,
                  }}



                  className="
                  relative
                  flex
                  gap-8
                  "

                >





                  {/* Number */}

                  <motion.div

                    whileHover={{
                      scale:1.1,
                    }}

                    className="
                    relative
                    z-10
                    flex
                    h-16
                    w-16
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-black
                    text-sm
                    font-bold
                    text-white
                    "

                  >

                    {service.number}


                  </motion.div>







                  {/* Content */}

                  <motion.div

                    whileHover={{
                      y:-8,
                    }}


                    className="
                    group
                    flex-1
                    rounded-3xl
                    border
                    border-zinc-200
                    bg-white
                    p-8
                    shadow-sm
                    transition
                    hover:shadow-2xl
                    "

                  >


                    <div
                      className="
                      flex
                      items-center
                      justify-between
                      "
                    >

                      <Icon
                        className="
                        h-8
                        w-8
                        "
                      />



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
                      mt-6
                      text-2xl
                      font-semibold
                      text-black
                      "
                    >

                      {service.title}

                    </h3>





                    <p
                      className="
                      mt-3
                      leading-7
                      text-zinc-600
                      "
                    >

                      {service.description}

                    </p>



                  </motion.div>




                </motion.div>


              );


            })}


          </div>


        </div>



      </div>



    </section>


  );

}

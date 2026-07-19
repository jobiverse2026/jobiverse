"use client";

import { motion } from "framer-motion";
import {
  FileText,
  ScanSearch,
  Target,
  MessageSquareText,
  BrainCircuit,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";


const aiFeatures = [
  {
    title: "AI Resume Builder",
    description:
      "Create professional resumes optimized for modern recruitment standards and employer expectations.",
    icon: FileText,
  },

  {
    title: "Resume Intelligence",
    description:
      "Analyze your profile and receive AI-driven recommendations to improve your career visibility.",
    icon: ScanSearch,
  },

  {
    title: "ATS Compatibility",
    description:
      "Understand how your resume performs against automated hiring systems used by organizations.",
    icon: Target,
  },

  {
    title: "Interview Intelligence",
    description:
      "Prepare smarter with AI-powered interview simulations, questions and personalized insights.",
    icon: MessageSquareText,
  },

  {
    title: "Career Coach AI",
    description:
      "Get personalized career guidance based on your skills, goals and professional journey.",
    icon: BrainCircuit,
  },

  {
    title: "Smart Job Matching",
    description:
      "Connect the right talent with the right opportunities using intelligent matching technology.",
    icon: Sparkles,
  },
];



export function AIFuture() {


  return (

    <section
      className="
      relative
      jv-noise
      jv-orbit-divider
      overflow-hidden
      border-t
      border-zinc-800
      bg-[radial-gradient(circle_at_70%_20%,rgba(76,29,149,.38),transparent_32rem),linear-gradient(145deg,#050507,#11111a)]
      py-32
      text-white
      "
    >




      {/* Glow */}

      <div
        className="
        absolute
        left-1/2
        top-0
        h-96
        w-96
        -translate-x-1/2
        rounded-full
        bg-zinc-700
        opacity-20
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
            text-zinc-400
            "
          >

            JOBIVERSE INTELLIGENCE LAYER

          </p>





          <h2
            className="
            mt-6
            text-4xl
            font-bold
            tracking-tight
            sm:text-6xl
            "
          >

            The Future Of Hiring

            <br />

            Powered By Intelligence.

          </h2>






          <p
            className="
            mt-6
            text-lg
            leading-8
            text-zinc-400
            "
          >

            Combining human recruitment expertise with artificial
            intelligence to create smarter hiring and career experiences.

          </p>




        </motion.div>









        {/* Cards */}

        <div
          className="
          mt-20
          grid
          gap-6
          md:grid-cols-2
          lg:grid-cols-3
          "
        >




          {aiFeatures.map((feature,index)=>{


            const Icon=feature.icon;



            return (


              <motion.div



                key={feature.title}



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
                border-zinc-800
                bg-zinc-950
                p-8
                transition-all
                hover:border-zinc-500
                hover:shadow-2xl
                "


              >





                {/* Hover Glow */}

                <div
                  className="
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-zinc-800/40
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
                      bg-white
                      text-black
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
                      text-zinc-400
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
                    "
                  >

                    {feature.title}

                  </h3>

                  <span className="mt-3 inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
                    Coming Soon
                  </span>






                  <p
                    className="
                    mt-4
                    text-sm
                    leading-7
                    text-zinc-400
                    "
                  >

                    {feature.description}

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

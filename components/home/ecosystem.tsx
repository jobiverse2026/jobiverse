"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Users,
  BrainCircuit,
  BriefcaseBusiness,
  ArrowUpRight,
} from "lucide-react";


const ecosystem = [
  {
    title: "Employers",
    description:
      "Build high-performing teams faster with expert recruitment solutions, industry knowledge and quality talent access.",
    icon: Building2,
  },
  {
    title: "Candidates",
    description:
      "Discover meaningful opportunities, improve your career profile and grow from your first job to leadership.",
    icon: Users,
  },
  {
    title: "AI Hiring",
    description:
      "Experience the future of recruitment with intelligent tools designed for smarter hiring decisions.",
    icon: BrainCircuit,
  },
  {
    title: "Career Growth",
    description:
      "A complete career ecosystem supporting professionals at every stage of their journey.",
    icon: BriefcaseBusiness,
  },
];



export function Ecosystem() {


  return (

    <section
      className="
      relative
      jv-orbit-divider
      overflow-hidden
      border-b
      border-zinc-200
      bg-white/55
      py-32
      "
    >


      {/* Background */}

      <div
        className="
        absolute
        inset-0
        bg-[radial-gradient(circle_at_top,#e4e4e7,transparent_40%)]
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

            THE JOBIVERSE ECOSYSTEM

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

            One Universe.

            <br />

            Endless Possibilities.

          </h2>




          <p
            className="
            mx-auto
            mt-6
            max-w-2xl
            text-lg
            leading-8
            text-zinc-600
            "
          >

            A connected ecosystem where companies,
            candidates and intelligent technology come together
            to create better hiring experiences.

          </p>


        </motion.div>







        {/* Cards */}

        <div
          className="
          mt-20
          grid
          gap-6
          md:grid-cols-2
          lg:grid-cols-4
          "
        >



          {ecosystem.map((item,index)=>{


            const Icon=item.icon;



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
                  delay:index*.12,
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
                bg-white
                p-8
                shadow-sm
                transition-all
                duration-300
                hover:shadow-2xl
                "


              >



                {/* Hover Glow */}

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
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-black
                    text-white
                    transition
                    duration-300
                    group-hover:scale-110
                    "
                  >

                    <Icon className="h-7 w-7"/>

                  </div>






                  <h3
                    className="
                    mt-7
                    flex
                    items-center
                    gap-2
                    text-xl
                    font-semibold
                    text-black
                    "
                  >

                    {item.title}


                    <ArrowUpRight
                      className="
                      h-4
                      w-4
                      opacity-0
                      transition
                      group-hover:opacity-100
                      "
                    />


                  </h3>






                  <p
                    className="
                    mt-4
                    text-sm
                    leading-7
                    text-zinc-600
                    "
                  >

                    {item.description}

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

"use client";

import { motion } from "framer-motion";
import {
  Search,
  UsersRound,
  BrainCircuit,
  Handshake,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";


const services = [
  {
    number: "01",
    title: "Talent Discovery",
    description:
      "Identify exceptional professionals through advanced sourcing, industry expertise and a powerful talent network.",
    icon: Search,
  },

  {
    number: "02",
    title: "Recruitment Solutions",
    description:
      "Complete hiring support across IT and Non-IT functions, from requirement understanding to successful placement.",
    icon: UsersRound,
  },

  {
    number: "03",
    title: "AI Powered Hiring",
    description:
      "Future-ready recruitment powered by intelligent matching, smarter screening and data-driven decisions.",
    icon: BrainCircuit,
  },

  {
    number: "04",
    title: "Executive Search",
    description:
      "Strategic talent acquisition for leadership and specialized roles where the right fit matters most.",
    icon: Handshake,
  },

  {
    number: "05",
    title: "Career Services",
    description:
      "Helping professionals grow with resume guidance, career support and opportunities aligned with their goals.",
    icon: TrendingUp,
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

            OUR SERVICES

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

            Hiring Solutions

            <br />

            Built For Growth.

          </h2>





          <p
            className="
            mt-6
            text-lg
            leading-8
            text-zinc-600
            "
          >

            From discovering talent to developing careers,
            JobiVerse provides complete hiring solutions
            for the modern workforce.

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

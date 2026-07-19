"use client";

import { motion } from "framer-motion";

import {
  ClipboardList,
  Search,
  UserCheck,
  MessagesSquare,
  CheckCircle2,
} from "lucide-react";



const process = [

  {
    number: "01",
    title: "Understand Requirements",
    description:
      "We start by understanding your business goals, role expectations, technical requirements and hiring challenges.",
    icon: ClipboardList,
  },


  {
    number: "02",
    title: "Talent Mapping & Search",
    description:
      "Our recruitment specialists identify suitable professionals through sourcing, networks and market intelligence.",
    icon: Search,
  },


  {
    number: "03",
    title: "Screen & Evaluate",
    description:
      "Candidates are evaluated based on skills, experience, cultural alignment and role suitability.",
    icon: UserCheck,
  },


  {
    number: "04",
    title: "Interview Support",
    description:
      "We coordinate communication, feedback and interview processes between companies and candidates.",
    icon: MessagesSquare,
  },


  {
    number: "05",
    title: "Successful Placement",
    description:
      "We support the final stages of hiring to ensure a smooth joining experience and long-term success.",
    icon: CheckCircle2,
  },

];





export function HowWeWork() {


  return (


    <section className="border-t border-zinc-200 bg-zinc-50 py-28">


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

            OUR PROCESS

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

            A Smarter Approach
            <br />
            To Hiring.

          </h2>





          <p
            className="
            mt-6
            text-lg
            leading-8
            text-zinc-600
            "
          >

            A structured recruitment journey combining human expertise,
            professional networks and technology-driven solutions.

          </p>



        </motion.div>









        {/* Steps */}


        <div
          className="
          relative
          mx-auto
          mt-16
          max-w-5xl
          "
        >




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





          <div className="space-y-8">



            {process.map((item,index)=>{


              const Icon=item.icon;



              return (


                <motion.div


                  key={item.number}


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
                    delay:index*0.1,
                  }}




                  className="
                  relative
                  flex
                  gap-8
                  "

                >





                  {/* Number */}


                  <div
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

                    {item.number}

                  </div>








                  {/* Content */}


                  <div
                    className="
                    flex-1
                    rounded-3xl
                    border
                    border-zinc-200
                    bg-white
                    p-8
                    transition
                    hover:-translate-y-2
                    hover:shadow-xl
                    "
                  >



                    <Icon className="h-8 w-8"/>




                    <h3
                      className="
                      mt-5
                      text-2xl
                      font-bold
                      "
                    >

                      {item.title}

                    </h3>





                    <p
                      className="
                      mt-3
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




      </div>


    </section>


  );


}
"use client";

import { motion } from "framer-motion";
import {
  Globe2,
  Network,
  Award,
  Layers3,
  ArrowUpRight,
} from "lucide-react";


const advantages = [
  {
    number: "20+",
    title: "Years of Recruitment Excellence",
    description:
      "Built on two decades of hiring experience, industry understanding and real-world recruitment expertise.",
    icon: Award,
  },

  {
    number: "35K+",
    title: "Professional Network",
    description:
      "A powerful talent network helping businesses connect with skilled professionals faster.",
    icon: Network,
  },

  {
    number: "10+",
    title: "Global Hiring Exposure",
    description:
      "Experience across multiple countries enabling businesses to access wider talent markets.",
    icon: Globe2,
  },

  {
    number: "IT + Non IT",
    title: "Multi-Industry Expertise",
    description:
      "Supporting organizations across technology, business functions and diverse sectors.",
    icon: Layers3,
  },
];



export function WhyJobiverse() {


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



      <div
        className="
        absolute
        right-0
        top-20
        h-72
        w-72
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

            WHY JOBIVERSE

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

            Experience Meets

            <br />

            The Future Of Hiring.

          </h2>





          <p
            className="
            mt-6
            text-lg
            leading-8
            text-zinc-600
            "
          >

            Combining human recruitment expertise with technology
            to create a smarter, faster and more reliable hiring ecosystem.

          </p>



        </motion.div>








        {/* Cards */}

        <div
          className="
          mt-20
          grid
          gap-6
          md:grid-cols-2
          "
        >



          {advantages.map((item,index)=>{


            const Icon=item.icon;



            return (


              <motion.div


                key={item.title}


                initial={{
                  opacity:0,
                  x:index%2===0?-40:40,
                }}


                whileInView={{
                  opacity:1,
                  x:0,
                }}


                viewport={{
                  once:true,
                }}


                transition={{
                  duration:.6,
                  delay:index*.1,
                }}


                whileHover={{
                  y:-8,
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
                transition
                hover:bg-white
                hover:shadow-2xl
                "

              >



                {/* Hover background */}

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



                <div className="relative flex gap-6">





                  <div

                    className="
                    flex
                    h-16
                    w-16
                    shrink-0
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







                  <div>


                    <h3
                      className="
                      text-3xl
                      font-bold
                      text-black
                      "
                    >

                      {item.number}

                    </h3>




                    <h4
                      className="
                      mt-2
                      flex
                      items-center
                      gap-2
                      text-lg
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


                  </div>



                </div>


              </motion.div>


            );


          })}



        </div>



      </div>



    </section>

  );

}

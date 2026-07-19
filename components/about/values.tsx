"use client";

import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Users,
  Globe2,
  Sparkles,
} from "lucide-react";

const values = [
  {
    title: "Our Mission",
    description:
      "To simplify hiring by connecting businesses with exceptional talent while helping professionals build successful careers through expertise, technology and meaningful relationships.",
    icon: Target,
  },

  {
    title: "Our Vision",
    description:
      "To become India's most trusted hiring ecosystem where companies, candidates and intelligent technology come together to create better opportunities.",
    icon: Eye,
  },

  {
    title: "Our Network",
    description:
      "A strong professional ecosystem powered by 35,000+ connections across industries, enabling faster and smarter talent discovery.",
    icon: Users,
  },

  {
    title: "Global Mindset",
    description:
      "Combining local recruitment expertise with global hiring exposure across multiple countries and diverse business environments.",
    icon: Globe2,
  },
];


export function Values() {
  return (
    <section className="border-t border-zinc-200 bg-white py-28">

      <div className="mx-auto max-w-7xl px-6 lg:px-8">


        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
          }}

          viewport={{
            once: true,
          }}

          transition={{
            duration: 0.6,
          }}

          className="mx-auto max-w-3xl text-center"
        >

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            OUR VALUES
          </p>


          <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            What Drives
            <br />
            Everything We Build.
          </h2>


          <p className="mt-6 text-lg leading-8 text-zinc-600">
            Our foundation is built on trust, innovation and a commitment
            to creating meaningful hiring experiences.
          </p>


        </motion.div>



        <div className="mt-16 grid gap-6 md:grid-cols-2">


          {values.map((item, index) => {

            const Icon = item.icon;


            return (

              <motion.div

                key={item.title}

                initial={{
                  opacity: 0,
                  y: 40,
                }}

                whileInView={{
                  opacity: 1,
                  y: 0,
                }}

                viewport={{
                  once: true,
                }}

                transition={{
                  delay: index * 0.1,
                }}

                whileHover={{
                  y: -8,
                }}

                className="
                group
                rounded-[32px]
                border
                border-zinc-200
                bg-zinc-50
                p-8
                transition
                hover:bg-white
                hover:shadow-2xl
                "
              >


                <div className="
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
                ">

                  <Icon className="h-7 w-7" />

                </div>



                <div className="mt-8 flex items-start justify-between">


                  <h3 className="text-2xl font-bold">
                    {item.title}
                  </h3>


                  <Sparkles className="h-5 w-5 text-zinc-400" />


                </div>



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
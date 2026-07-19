"use client";

import { motion } from "framer-motion";
import {
  Quote,
  ArrowRight,
} from "lucide-react";
import { LinkedInIcon } from "@/components/common/social-icons";

import Link from "next/link";


export function FounderMessage() {

  return (

    <section className="border-t border-zinc-200 bg-zinc-50 py-28">

      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="grid items-center gap-12 lg:grid-cols-2">


          {/* Founder Placeholder */}

          <motion.div

            initial={{
              opacity: 0,
              x: -40,
            }}

            whileInView={{
              opacity: 1,
              x: 0,
            }}

            viewport={{
              once: true,
            }}

            className="relative"

          >

            <div
              className="
              aspect-square
              max-w-md
              rounded-[40px]
              bg-black
              p-8
              "
            >

              <div
                className="
                flex
                h-full
                items-center
                justify-center
                rounded-[32px]
                border
                border-zinc-800
                "
              >

                <div className="text-center text-white">

                  <h3 className="text-5xl font-bold">
                    JobiVerse
                  </h3>

                  <p className="mt-3 text-zinc-400">
                    Founder Message
                  </p>

                </div>

              </div>

            </div>


            <div
              className="
              absolute
              -bottom-6
              -right-6
              rounded-3xl
              bg-white
              p-6
              shadow-xl
              border
              border-zinc-200
              "
            >

              <p className="text-sm text-zinc-500">
                Vision
              </p>

              <p className="font-bold">
                Future Of Hiring
              </p>

            </div>


          </motion.div>





          {/* Content */}


          <motion.div

            initial={{
              opacity:0,
              x:40,
            }}

            whileInView={{
              opacity:1,
              x:0,
            }}

            viewport={{
              once:true,
            }}

          >

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              FOUNDER'S MESSAGE
            </p>



            <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">

              Building A Better
              <br />
              Hiring Ecosystem.

            </h2>



            <div className="mt-8 flex gap-4">

              <Quote className="h-8 w-8 shrink-0 text-zinc-400"/>


              <p className="text-lg leading-8 text-zinc-600">

                Hiring is not just about finding people.
                It is about creating connections between
                talent, businesses and opportunities.

              </p>


            </div>




            <p className="mt-6 leading-8 text-zinc-600">

              JobiVerse combines recruitment expertise,
              professional networks and technology to create
              smarter hiring experiences for companies and
              better career opportunities for professionals.

            </p>




            <div className="mt-8 flex flex-wrap gap-4">


              <Link

                href="/contact"

                className="
                group
                flex
                items-center
                gap-2
                rounded-xl
                bg-black
                px-6
                py-3
                text-sm
                font-medium
                text-white
                transition
                hover:bg-zinc-800
                "

              >

                Connect With Us

                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1"/>

              </Link>



              <Link

                href="https://www.linkedin.com/in/jobiverse"

                target="_blank"

                className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-zinc-300
                px-6
                py-3
                text-sm
                font-medium
                hover:bg-white
                "

              >

                <LinkedInIcon className="h-4 w-4" />

                LinkedIn

              </Link>


            </div>


          </motion.div>


        </div>


      </div>


    </section>

  );

}

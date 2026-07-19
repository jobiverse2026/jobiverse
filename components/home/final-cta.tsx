"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  UserRound,
  Sparkles,
} from "lucide-react";



export function FinalCTA() {


  return (

    <section
      className="
      relative
      jv-orbit-divider
      overflow-hidden
      border-t
      border-zinc-200
      bg-[radial-gradient(circle_at_50%_0%,rgba(161,161,170,.18),transparent_28rem),linear-gradient(180deg,#fafafa,#ffffff)]
      py-32
      text-zinc-950
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
        bg-zinc-300
        opacity-30
        blur-3xl
        "
      />





      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">





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
          max-w-4xl
          text-center
          "

        >




          <div
            className="
            mx-auto
            flex
            w-fit
            items-center
            gap-2
            rounded-full
            border
            border-zinc-200
            bg-white/80
            px-5
            py-2
            text-sm
            text-zinc-600
            "
          >

            <Sparkles className="h-4 w-4"/>

            Start Your Journey With JobiVerse

          </div>







          <h2
            className="
            mt-8
            text-4xl
            font-bold
            tracking-tight
            sm:text-6xl
            "
          >

            Building The Future Of

            <br />

            Hiring Starts Here.

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

            Whether you are growing your team or growing your career,
            JobiVerse connects ambition with opportunity.

          </p>








          <div
            className="
            mt-14
            grid
            gap-6
            md:grid-cols-2
            "
          >





            {/* Employer */}

            <Link

              href="/employers"

              className="
              group
              rounded-3xl
              border
              jv-card
              border-zinc-200
              bg-white
              p-8
              text-left
              transition-all
              hover:-translate-y-2
              hover:border-zinc-400
              hover:shadow-2xl
              "

            >


              <Building2 className="h-9 w-9"/>





              <h3
                className="
                mt-7
                text-2xl
                font-semibold
                "
              >

                Build Your Team

              </h3>





              <p
                className="
                mt-3
                leading-7
                text-zinc-600
                "
              >

                Access skilled professionals and find the right
                talent to accelerate your business growth.

              </p>






              <div
                className="
                mt-7
                flex
                items-center
                gap-2
                text-sm
                font-medium
                "
              >

                Hire Talent


                <ArrowRight
                  className="
                  transition
                  group-hover:translate-x-1
                  "
                />

              </div>



            </Link>









            {/* Candidate */}

            <Link

              href="/candidates"

              className="
              group
              rounded-3xl
              border
              jv-card
              border-zinc-200
              bg-white
              p-8
              text-left
              transition-all
              hover:-translate-y-2
              hover:border-zinc-400
              hover:shadow-2xl
              "

            >



              <UserRound className="h-9 w-9"/>






              <h3
                className="
                mt-7
                text-2xl
                font-semibold
                "
              >

                Grow Your Career

              </h3>





              <p
                className="
                mt-3
                leading-7
                text-zinc-600
                "
              >

                Discover opportunities, improve your profile
                and move towards your career goals.

              </p>






              <div
                className="
                mt-7
                flex
                items-center
                gap-2
                text-sm
                font-medium
                "
              >

                Explore Opportunities


                <ArrowRight
                  className="
                  transition
                  group-hover:translate-x-1
                  "
                />

              </div>



            </Link>






          </div>





        </motion.div>




      </div>



    </section>


  );

}

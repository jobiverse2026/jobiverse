"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Users,
  Globe2,
} from "lucide-react";


export function Hero() {


  return (

    <section
      className="
      relative
      overflow-hidden
      bg-white
      py-24
      lg:py-32
      "
    >



      {/* Background Grid */}

      <div

        className="
        absolute
        inset-0
        -z-10
        bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)]
        bg-[size:60px_60px]
        opacity-40
        "

      />





      <div className="mx-auto max-w-7xl px-6 lg:px-8">



        <div className="text-center">



          <motion.div

            initial={{
              opacity:0,
              y:20,
            }}

            animate={{
              opacity:1,
              y:0,
            }}

            transition={{
              duration:0.6,
            }}

            className="
            inline-flex
            rounded-full
            border
            border-zinc-200
            bg-white
            px-5
            py-2
            text-sm
            text-zinc-600
            shadow-sm
            "

          >

            India's Hiring & Career Platform


          </motion.div>









          <motion.h1

            initial={{
              opacity:0,
              y:30,
            }}

            animate={{
              opacity:1,
              y:0,
            }}

            transition={{
              duration:0.7,
              delay:0.1,
            }}

            className="
            mx-auto
            mt-8
            max-w-5xl
            text-5xl
            font-bold
            tracking-tight
            text-black
            sm:text-6xl
            lg:text-7xl
            "

          >

            Bridging Business with Talent

            <span className="block">

              Empowering People with Careers

            </span>


          </motion.h1>









          <motion.p

            initial={{
              opacity:0,
              y:30,
            }}

            animate={{
              opacity:1,
              y:0,
            }}

            transition={{
              duration:0.7,
              delay:0.2,
            }}

            className="
            mx-auto
            mt-8
            max-w-2xl
            text-lg
            leading-8
            text-zinc-600
            "

          >

            JobiVerse connects companies with exceptional talent
            and helps professionals build successful careers
            through technology-driven hiring solutions.


          </motion.p>









          <motion.div

            initial={{
              opacity:0,
              y:20,
            }}

            animate={{
              opacity:1,
              y:0,
            }}

            transition={{
              delay:0.3,
            }}

            className="
            mt-10
            flex
            flex-col
            justify-center
            gap-4
            sm:flex-row
            "

          >


            <Link

              href="/employers"

              className="
              flex
              items-center
              justify-center
              rounded-xl
              bg-black
              px-8
              py-4
              font-medium
              text-white
              transition
              hover:bg-zinc-800
              "

            >

              Hire Talent

              <ArrowRight className="ml-2 h-5 w-5"/>


            </Link>





            <Link

              href="/candidates"

              className="
              rounded-xl
              border
              border-zinc-300
              px-8
              py-4
              font-medium
              text-black
              transition
              hover:bg-zinc-100
              "

            >

              Find Opportunities


            </Link>



          </motion.div>




        </div>









        {/* Stats */}


        <motion.div

          initial={{
            opacity:0,
            y:40,
          }}

          animate={{
            opacity:1,
            y:0,
          }}

          transition={{
            delay:0.5,
          }}

          className="
          mx-auto
          mt-24
          grid
          max-w-4xl
          gap-6
          md:grid-cols-3
          "

        >



          <StatCard

            icon={Users}

            title="20+ Years"

            text="Combined Recruitment Experience"

          />



          <StatCard

            icon={Building2}

            title="35,000+"

            text="Professional Connections"

          />



          <StatCard

            icon={Globe2}

            title="10+ Countries"

            text="Global Hiring Exposure"

          />



        </motion.div>






      </div>


    </section>


  );

}





function StatCard({

  icon:Icon,

  title,

  text,

}:{

  icon:any;

  title:string;

  text:string;

}) {


  return (

    <div

      className="
      rounded-3xl
      border
      border-zinc-200
      bg-white
      p-6
      text-center
      shadow-sm
      transition
      hover:-translate-y-2
      hover:shadow-xl
      "

    >


      <Icon className="mx-auto h-8 w-8"/>


      <h3 className="mt-4 text-2xl font-bold">

        {title}

      </h3>


      <p className="mt-2 text-sm text-zinc-500">

        {text}

      </p>


    </div>

  );

}
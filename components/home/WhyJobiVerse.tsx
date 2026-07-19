"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Clock3,
  ShieldCheck,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Powered Hiring",
    description:
      "Smart matching, resume intelligence and AI-driven recruitment workflows.",
    gradient:
      "from-blue-600 via-violet-600 to-cyan-500",
  },
  {
    icon: Clock3,
    title: "Fast Hiring",
    description:
      "Reduce hiring time with our dedicated recruitment specialists.",
    gradient:
      "from-orange-500 via-amber-500 to-yellow-400",
  },
  {
    icon: ShieldCheck,
    title: "Quality Screening",
    description:
      "Every profile goes through structured technical and HR evaluation.",
    gradient:
      "from-emerald-500 via-green-500 to-teal-500",
  },
  {
    icon: Users,
    title: "Dedicated Recruiters",
    description:
      "One point of contact for complete recruitment lifecycle management.",
    gradient:
      "from-pink-500 via-rose-500 to-red-500",
  },
];

export function WhyJobiVerse() {

  return (

    <section
      className="
      relative
      overflow-hidden
      bg-zinc-50
      py-28
      "
    >

      <div
        className="
        absolute
        inset-0
        bg-[radial-gradient(#d4d4d8_1px,transparent_1px)]
        [background-size:28px_28px]
        opacity-30
        "
      />

      <div className="relative mx-auto max-w-7xl px-6">

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

          className="text-center"

        >

          <div
            className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-white
            px-5
            py-2
            shadow
            "
          >

            <Sparkles
              size={16}
              className="text-violet-600"
            />

            <span
              className="
              text-sm
              font-semibold
              "
            >

              Why Companies Choose JobiVerse

            </span>

          </div>

          <h2
            className="
            mt-8
            text-5xl
            font-black
            tracking-tight
            lg:text-6xl
            "
          >

            Recruitment Built For

            <span
              className="
              bg-gradient-to-r
              from-blue-600
              via-violet-600
              to-cyan-500
              bg-clip-text
              text-transparent
              "
            >

              {" "}Modern Businesses

            </span>

          </h2>

          <p
            className="
            mx-auto
            mt-6
            max-w-3xl
            text-lg
            leading-8
            text-zinc-600
            "
          >

            Faster hiring, better quality candidates,
            transparent communication and future-ready
            AI recruitment technology.

          </p>

        </motion.div>

        <div
          className="
          mt-20
          grid
          gap-8
          lg:grid-cols-12
          "
        >          {/* Featured Card */}

          <motion.div

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
              duration:0.6,
            }}

            className="
            relative
            overflow-hidden
            rounded-[32px]
            bg-gradient-to-br
            from-blue-600
            via-violet-600
            to-cyan-500
            p-10
            text-white
            lg:col-span-5
            "
          >

            <div
              className="
              absolute
              -right-20
              -top-20
              h-64
              w-64
              rounded-full
              bg-white/10
              blur-3xl
              "
            />

            <span
              className="
              inline-flex
              rounded-full
              border
              border-white/20
              bg-white/10
              px-4
              py-2
              text-sm
              font-semibold
              backdrop-blur-xl
              "
            >
              Recruitment Partner
            </span>

            <h3
              className="
              mt-8
              text-4xl
              font-black
              leading-tight
              "
            >
              Hiring shouldn't
              be slow,
              expensive or
              complicated.
            </h3>

            <p
              className="
              mt-6
              max-w-md
              leading-8
              text-white/90
              "
            >
              We combine recruitment expertise,
              technology and a dedicated hiring
              team to help companies scale with
              confidence.
            </p>

            <button
              className="
              group
              mt-10
              inline-flex
              items-center
              gap-3
              rounded-2xl
              bg-white
              px-6
              py-4
              font-semibold
              text-black
              transition-all
              duration-300
              hover:scale-105
              "
            >
              Explore Services

              <ArrowRight
                className="
                transition-transform
                duration-300
                group-hover:translate-x-1
                "
                size={18}
              />
            </button>

          </motion.div>

          {/* Features */}

          <div
            className="
            grid
            gap-6
            sm:grid-cols-2
            lg:col-span-7
            "
          >            {features.map((feature, index) => {

              const Icon = feature.icon;

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
                    duration:0.5,
                    delay:index * 0.08,
                  }}

                  whileHover={{
                    y:-8,
                  }}

                  className="
                  group
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-zinc-200
                  bg-white
                  p-8
                  shadow-sm
                  transition-all
                  duration-300
                  hover:border-blue-200
                  hover:shadow-2xl
                  "

                >

                  <div
                    className={`
                    inline-flex
                    rounded-2xl
                    bg-gradient-to-r
                    ${feature.gradient}
                    p-4
                    text-white
                    shadow-lg
                    `}
                  >

                    <Icon size={28} />

                  </div>

                  <h3
                    className="
                    mt-8
                    text-2xl
                    font-bold
                    "
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="
                    mt-4
                    leading-7
                    text-zinc-600
                    "
                  >
                    {feature.description}
                  </p>

                  <div
                    className="
                    absolute
                    -right-12
                    -top-12
                    h-32
                    w-32
                    rounded-full
                    bg-gradient-to-br
                    from-blue-500/10
                    via-violet-500/10
                    to-cyan-500/10
                    blur-2xl
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                    "
                  />

                </motion.div>

              );

            })}

          </div>

        </div>

      </div>

    </section>

  );

}

"use client";

import { motion } from "framer-motion";
import {
  Users,
  Building2,
  Briefcase,
  Globe2,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50K+",
    label: "Candidate Network",
    description:
      "Growing database of skilled professionals.",
  },
  {
    icon: Building2,
    value: "500+",
    label: "Hiring Companies",
    description:
      "Startups, SMBs & Enterprises hiring through us.",
  },
  {
    icon: Briefcase,
    value: "20+",
    label: "Years Experience",
    description:
      "Combined recruitment expertise of our leadership.",
  },
  {
    icon: Globe2,
    value: "10+",
    label: "Countries",
    description:
      "Global hiring exposure across multiple regions.",
  },
];

export function Stats() {
  return (
    <section className="bg-white py-24">

      <div className="mx-auto max-w-7xl px-6">

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
            duration:0.6,
          }}

          className="text-center"

        >

          <span
            className="
            rounded-full
            bg-zinc-100
            px-4
            py-2
            text-sm
            font-semibold
            "
          >

            WHY JOBIVERSE

          </span>

          <h2
            className="
            mt-6
            text-5xl
            font-black
            tracking-tight
            "
          >

            Trusted By Growing Businesses

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

            We combine recruitment expertise,
            technology and speed to help companies
            hire better talent while helping
            professionals build meaningful careers.

          </p>

        </motion.div>

        <div
          className="
          mt-20
          grid
          gap-8
          md:grid-cols-2
          xl:grid-cols-4
          "
        >          {stats.map((item, index) => {

            const Icon = item.icon;

            return (

              <motion.div

                key={item.label}

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
                  delay:index * 0.1,
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
                hover:border-blue-200
                hover:shadow-2xl
                "

              >

                {/* Glow */}

                <div
                  className="
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-gradient-to-br
                  from-blue-500/10
                  via-violet-500/10
                  to-cyan-500/10
                  blur-3xl
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                  "
                />

                <div
                  className="
                  relative
                  z-10
                  "
                >

                  <div
                    className="
                    inline-flex
                    rounded-2xl
                    bg-gradient-to-r
                    from-blue-600
                    via-violet-600
                    to-cyan-500
                    p-4
                    text-white
                    shadow-lg
                    "
                  >

                    <Icon size={28} />

                  </div>

                  <h3
                    className="
                    mt-8
                    text-5xl
                    font-black
                    tracking-tight
                    "
                  >
                    {item.value}
                  </h3>

                  <p
                    className="
                    mt-3
                    text-lg
                    font-semibold
                    text-zinc-900
                    "
                  >
                    {item.label}
                  </p>

                  <p
                    className="
                    mt-4
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
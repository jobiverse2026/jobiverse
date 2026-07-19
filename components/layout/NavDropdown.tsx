"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import type { NavChild } from "./nav-data";

type Props = {
  items: NavChild[];
  onItemClick?: () => void;
};

export default function NavDropdown({
  items,
  onItemClick,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 12,
        scale: 0.96,
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className="
      absolute
      left-1/2
      top-full
      mt-5
      w-[760px]
      -translate-x-1/2
      overflow-hidden
      rounded-[32px]
      border
      border-white/60
      bg-white
      shadow-[0_25px_80px_rgba(0,0,0,0.18)]
      "
    >
      {/* Background */}
      <div
        className="
        absolute
        inset-0
        bg-gradient-to-br
        from-blue-50
        via-white
        to-violet-50
        "
      />

      {/* Menu */}
      <div
        className="
        relative
        z-10
        grid
        grid-cols-2
        gap-2
        p-4
        "
      >
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
            >
              <Link
                href={item.href}
                onClick={onItemClick}
                className="
                group
                block
                rounded-2xl
                border
                border-transparent
                bg-white/70
                p-5
                backdrop-blur-xl
                transition-all
                duration-300
                hover:border-zinc-200
                hover:bg-white
                hover:shadow-lg
                "
              >
                <div
                  className="
                  flex
                  items-start
                  justify-between
                  gap-4
                  "
                >
                  <div
                    className="
                    flex
                    gap-4
                    "
                  >
                    {Icon && (
                      <div
                        className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-blue-50
                        via-violet-50
                        to-cyan-50
                        text-blue-600
                        transition-all
                        duration-300
                        group-hover:scale-110
                        "
                      >
                        <Icon size={22} />
                      </div>
                    )}

                    <div>
                      <div
                        className="
                        flex
                        items-center
                        gap-2
                        "
                      >
                        <h4
                          className="
                          font-semibold
                          text-zinc-900
                          "
                        >
                          {item.title}
                        </h4>

                        {item.badge && (
                          <span
                            className="
                            rounded-full
                            bg-gradient-to-r
                            from-blue-600
                            via-violet-600
                            to-cyan-500
                            px-2.5
                            py-1
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-white
                            "
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p
                        className="
                        mt-2
                        text-sm
                        leading-6
                        text-zinc-600
                        "
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="
                    mt-1
                    text-zinc-300
                    transition-all
                    duration-300
                    group-hover:translate-x-1
                    group-hover:text-black
                    "
                  />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="
        relative
        z-10
        border-t
        border-zinc-200
        bg-white/70
        px-6
        py-5
        backdrop-blur-xl
        "
      >
        <div
          className="
          flex
          items-center
          justify-between
          "
        >
          <div>
            <p
              className="
              text-sm
              font-semibold
              text-zinc-900
              "
            >
              JobiVerse
            </p>

            <p
              className="
              mt-1
              text-sm
              text-zinc-500
              "
            >
              Bridging Businesses With Talent.
              Empowering People With Careers.
            </p>
          </div>

          <Link
            href="/contact"
            onClick={onItemClick}
            className="
            rounded-xl
            bg-gradient-to-r
            from-black
            via-zinc-800
            to-zinc-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-lg
            transition-all
            hover:scale-105
            "
          >
            Contact Us
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import { loginMenu, signupMenu } from "./nav-data";

type Props = {
  onItemClick?: () => void;
  mode?: "login" | "signup";
};

export default function LoginDropdown({ onItemClick, mode = "login" }: Props) {
  const menu = mode === "signup" ? signupMenu : loginMenu;
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
      mt-3
      w-[340px]
      -translate-x-1/2
      overflow-hidden
      rounded-[22px]
      border
      border-white/60
      bg-white
      shadow-[0_25px_80px_rgba(0,0,0,0.18)]
      "
    >
      <div
        className="
        bg-gradient-to-br
        from-zinc-50
        via-white
        to-zinc-100
        p-2
        "
      >
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={onItemClick}
              className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              p-3
              transition-all
              duration-300
              hover:bg-white
              hover:shadow-lg
              "
            >
              <div
                className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-zinc-950
                text-white
                transition-transform
                duration-300
                group-hover:scale-110
                "
              >
                {Icon && <Icon size={17} />}
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-semibold text-zinc-900">
                  {item.title}
                </h4>

                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                  {item.description}
                </p>
              </div>

              <ChevronRight
                size={18}
                className="
                text-zinc-300
                transition-all
                duration-300
                group-hover:translate-x-1
                group-hover:text-black
                "
              />
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

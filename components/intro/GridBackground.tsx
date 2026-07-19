"use client";

import { motion } from "framer-motion";

export default function GridBackground() {
  return (
    <>
      {/* Grid */}

      <motion.div
        animate={{
          opacity: [0.04, 0.08, 0.04],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Moving Highlight */}

      <motion.div
        animate={{
          x: ["-120%", "120%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        absolute
        top-0
        h-full
        w-64
        bg-gradient-to-r
        from-transparent
        via-white/60
        to-transparent
        blur-3xl
        "
      />
    </>
  );
}
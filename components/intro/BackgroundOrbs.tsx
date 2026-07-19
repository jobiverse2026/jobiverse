"use client";

import { motion } from "framer-motion";

export default function BackgroundOrbs() {
  return (
    <>
      {/* Orb 1 */}

      <motion.div
        animate={{
          x: [0, 80, -50, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
        absolute
        -left-32
        top-24
        h-80
        w-80
        rounded-full
        bg-black/5
        blur-[120px]
        "
      />

      {/* Orb 2 */}

      <motion.div
        animate={{
          x: [0, -120, 40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.8, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
        absolute
        right-[-120px]
        top-1/3
        h-[420px]
        w-[420px]
        rounded-full
        bg-black/5
        blur-[150px]
        "
      />

      {/* Orb 3 */}

      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -80, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
        absolute
        bottom-[-120px]
        left-1/2
        h-[350px]
        w-[350px]
        -translate-x-1/2
        rounded-full
        bg-black/5
        blur-[140px]
        "
      />
    </>
  );
}
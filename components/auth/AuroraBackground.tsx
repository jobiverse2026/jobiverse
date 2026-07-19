"use client";

import { motion } from "framer-motion";
import FloatingParticles from "./FloatingParticles";

export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-white">

      {/* Base Gradient */}
      <div
        className="
        absolute
        inset-0
        bg-gradient-to-br
        from-zinc-50
        via-white
        to-zinc-100
        "
      />


      {/* Aurora Blob 1 */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
        absolute
        -left-40
        -top-40
        h-[500px]
        w-[500px]
        rounded-full
        bg-blue-400/20
        blur-[120px]
        "
      />


      {/* Aurora Blob 2 */}
      <motion.div
        animate={{
          x: [0, -100, 60, 0],
          y: [0, 80, -40, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
        absolute
        right-[-150px]
        top-20
        h-[600px]
        w-[600px]
        rounded-full
        bg-purple-400/20
        blur-[140px]
        "
      />


      {/* Aurora Blob 3 */}
      <motion.div
        animate={{
          x: [0, 50, -80, 0],
          y: [0, 100, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
        absolute
        bottom-[-200px]
        left-[35%]
        h-[550px]
        w-[550px]
        rounded-full
        bg-cyan-400/20
        blur-[130px]
        "
      />


      {/* Grid Overlay */}
      <div
        className="
        absolute
        inset-0
        opacity-[0.03]
        "
        style={{
          backgroundImage:
            `
            linear-gradient(#000 1px, transparent 1px),
            linear-gradient(90deg, #000 1px, transparent 1px)
            `,
          backgroundSize:
            "60px 60px",
        }}
      />


      {/* Noise Texture */}
      <div
        className="
        absolute
        inset-0
        opacity-[0.04]
        "
        style={{
          backgroundImage:
            `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")
            `,
        }}
      />
<FloatingParticles />

    </div>
  );
}
"use client";

import { motion } from "framer-motion";

export default function NoiseOverlay() {
  return (
    <>
      {/* Moving Gradient */}

      <motion.div
        animate={{
          backgroundPosition: [
            "0% 50%",
            "100% 50%",
            "0% 50%",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        absolute
        inset-0
        opacity-40
        "
        style={{
          background:
            "linear-gradient(135deg,#ffffff 0%,#f5f5f5 30%,#e8e8e8 60%,#ffffff 100%)",
          backgroundSize: "300% 300%",
        }}
      />

      {/* Noise */}

      <div
        className="
        absolute
        inset-0
        opacity-[0.04]
        mix-blend-multiply
        "
        style={{
          backgroundImage: `
          radial-gradient(circle at 20% 20%,black 1px,transparent 1px),
          radial-gradient(circle at 80% 60%,black 1px,transparent 1px),
          radial-gradient(circle at 40% 80%,black 1px,transparent 1px),
          radial-gradient(circle at 60% 30%,black 1px,transparent 1px)
          `,
          backgroundSize: "18px 18px",
        }}
      />
    </>
  );
}
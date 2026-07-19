"use client";

import { motion } from "framer-motion";

export function TalentOrbit() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      <div className="absolute left-1/2 top-[48%] h-[760px] w-[1180px] -translate-x-1/2 -translate-y-1/2 opacity-80">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[10%] rounded-[50%] border border-violet-300/25"
          style={{ transform: "rotate(-7deg)" }}
        >
          <span className="absolute left-[13%] top-[12%] h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_24px_rgba(124,58,237,.85)]" />
          <span className="absolute bottom-[16%] right-[9%] h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_22px_rgba(34,211,238,.8)]" />
        </motion.div>

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 72, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[21%_7%] rounded-[50%] border border-blue-300/20"
          style={{ transform: "rotate(11deg)" }}
        >
          <span className="absolute right-[20%] top-[4%] h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,.75)]" />
        </motion.div>

        <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/10 blur-3xl" />

        <motion.span
          animate={{ opacity: [0.2, 0.75, 0.2], scale: [0.85, 1.2, 0.85] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[8%] top-[38%] h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_28px_6px_rgba(124,58,237,.22)]"
        />
        <motion.span
          animate={{ opacity: [0.25, 0.8, 0.25], scale: [0.9, 1.25, 0.9] }}
          transition={{ duration: 5.6, delay: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[9%] top-[28%] h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_28px_6px_rgba(34,211,238,.2)]"
        />
        <motion.span
          animate={{ opacity: [0.2, 0.65, 0.2], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 6.2, delay: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[12%] right-[18%] h-1 w-1 rounded-full bg-blue-500 shadow-[0_0_24px_5px_rgba(37,99,235,.2)]"
        />
      </div>
    </div>
  );
}

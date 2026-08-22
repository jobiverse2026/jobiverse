"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function GlobalMotionLayer() {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 25, restDelta: .002 });
  const [tone, setTone] = useState("professional");

  useEffect(() => {
    if (reduced || !matchMedia("(pointer:fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      const spotlight = target.closest<HTMLElement>(".jv-spotlight");
      if (spotlight) {
        const box = spotlight.getBoundingClientRect();
        spotlight.style.setProperty("--jv-x", `${event.clientX-box.left}px`);
        spotlight.style.setProperty("--jv-y", `${event.clientY-box.top}px`);
      }
      const magnetic = target.closest<HTMLElement>(".jv-magnetic");
      if (magnetic) {
        const box = magnetic.getBoundingClientRect();
        magnetic.style.setProperty("--jv-mx", `${(event.clientX-(box.left+box.width/2))*.08}px`);
        magnetic.style.setProperty("--jv-my", `${(event.clientY-(box.top+box.height/2))*.08}px`);
      }
    };
    const onOut = (event: PointerEvent) => {
      const magnetic = (event.target as HTMLElement).closest<HTMLElement>(".jv-magnetic");
      magnetic?.style.removeProperty("--jv-mx"); magnetic?.style.removeProperty("--jv-my");
    };
    window.addEventListener("pointermove", onMove); window.addEventListener("pointerout", onOut);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerout", onOut); };
  }, [reduced, pathname]);

  useEffect(() => {
    document.documentElement.dataset.universeTone = pathname === "/" ? tone : "default";
    return () => { document.documentElement.dataset.universeTone = "default"; };
  }, [pathname, tone]);

  useEffect(() => {
    if (pathname !== "/") return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-universe-tone]"));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setTone((entry.target as HTMLElement).dataset.universeTone || "professional"); }), { rootMargin: "-42% 0px -42% 0px" });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return <><div aria-hidden="true" data-tone={tone} className="jv-ambient-tone"/><div aria-hidden="true" className="jv-scroll-orbit"><motion.span style={{scaleY:progress}}/><motion.i style={{top:progress}}/></div></>;
}

"use client";

import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

export function HighEndWorldView({ active = false }: { active?: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const pointerX = useSpring(0, { stiffness: 90, damping: 24, mass: 0.8 });
  const pointerY = useSpring(0, { stiffness: 90, damping: 24, mass: 0.8 });

  useEffect(() => {
    if (reduce) return;
    const node = ref.current;
    if (!node) return;
    const onMove = (event: PointerEvent) => {
      pointerX.set((event.clientX / window.innerWidth - 0.5) * 2);
      pointerY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerX, pointerY, reduce]);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--bg)]">
      <motion.div
        className="absolute left-1/2 top-1/2 h-[72vw] w-[72vw] min-h-[520px] min-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[80px]"
        style={{ x: pointerX, y: pointerY }}
        animate={reduce ? undefined : { scale: [1, 1.035, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_42%),radial-gradient(circle_at_70%_65%,color-mix(in_srgb,var(--warm)_18%,transparent),transparent_48%),radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--ink)_7%,transparent),transparent_70%)]" />
      </motion.div>

      <motion.div
        className="absolute inset-[-20%] opacity-[0.035]"
        style={{ x: pointerX, y: pointerY }}
        animate={reduce ? undefined : { rotate: [0, -2, 0], scale: [1, 1.015, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute left-[8%] top-[4%] whitespace-nowrap text-[26vw] font-black leading-none tracking-[-0.11em]">MOMENT</div>
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,color-mix(in_srgb,var(--bg)_22%,transparent)_100%)]" />
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: active ? 0.2 : 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 24 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_25%,transparent),transparent_55%)]" />
      </motion.div>
    </div>
  );
}

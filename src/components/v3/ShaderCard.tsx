"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export function ShaderCard({
  prompt,
  participantCount,
  onEnter,
  entering = false,
}: {
  prompt: string;
  participantCount: number;
  onEnter: () => void;
  entering?: boolean;
}) {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [7, -7]), { stiffness: 170, damping: 22, mass: 0.8 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), { stiffness: 170, damping: 22, mass: 0.8 });
  const glowX = useSpring(useTransform(px, [-0.5, 0.5], [15, 85]), { stiffness: 120, damping: 25 });
  const glowY = useSpring(useTransform(py, [-0.5, 0.5], [15, 85]), { stiffness: 120, damping: 25 });

  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function reset() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={move}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
      animate={entering ? { scale: 1.04, rotateX: 0, rotateY: 0, y: -8 } : { scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 190, damping: 24, mass: 0.8 }}
      className="relative mx-auto w-full max-w-[470px] [transform-style:preserve-3d]"
    >
      <div className="absolute -inset-3 rounded-[42px] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] blur-2xl" />
      <div className="relative aspect-[0.82] overflow-hidden rounded-[38px] border border-white/10 bg-neutral-950 p-7 text-white shadow-[0_35px_100px_rgba(0,0,0,0.22)] sm:p-9">
        <motion.div
          className="pointer-events-none absolute -inset-1/2 opacity-70"
          style={{ background: useTransform([glowX, glowY], ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,.18), transparent 20%, rgba(255,255,255,.035) 36%, transparent 58%)`) }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_15%,rgba(255,255,255,.05)_48%,transparent_58%)] opacity-60" />

        <div className="relative flex h-full flex-col justify-between [transform:translateZ(24px)]">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">MOMENT DROP</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">TODAY</p>
          </div>

          <div>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">THE QUESTION</p>
            <h2 className="text-[clamp(2rem,6vw,3.8rem)] font-medium leading-[0.95] tracking-[-0.06em]">{prompt}</h2>
          </div>

          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-2xl font-medium tracking-[-0.04em]">{participantCount.toLocaleString()}</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">people are in</p>
            </div>
            <motion.button
              type="button"
              onClick={onEnter}
              disabled={entering}
              whileTap={reduce ? undefined : { scale: 0.94 }}
              className="rounded-full border border-white/20 bg-white px-6 py-3 text-[10px] font-black tracking-[0.18em] text-neutral-950 transition-transform disabled:opacity-60"
            >
              {entering ? "ENTERING" : "ENTER →"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

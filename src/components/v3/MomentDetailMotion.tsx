"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { AmbientBackground, NumericTicker, RevealSequence } from "@/components/v3/MotionSystem";

export function MomentDetailMotion({ prompt, participantCount, live, children }: { prompt: string; participantCount: number; live: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <main className="relative min-h-[calc(100vh-7rem)] overflow-hidden py-6 sm:py-10">
      <AmbientBackground intensity={0.7} />
      <Link href="/" className="relative text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)] transition-opacity hover:opacity-60">← MOMENT</Link>
      <section className="relative mt-16 max-w-4xl">
        <RevealSequence>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">{live ? "ACTIVE MOMENT" : "MOMENT"}</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.7rem,8vw,6.5rem)] font-black leading-[0.9] tracking-[-0.065em]">{prompt}</h1>
          <div className="mt-7 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            <span><NumericTicker value={participantCount.toLocaleString()} /> PEOPLE ARE IN THIS MOMENT.</span>
            <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
            <span>{live ? "LIVE" : "WAITING"}</span>
          </div>
        </RevealSequence>

        <motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }} className="mt-12">
          {children}
        </motion.div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { AmbientBackground } from "@/components/v3/MotionSystem";

export function JourneyMotion({ count, children }: { count: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <main className="relative min-h-[calc(100vh-7rem)] overflow-hidden py-10 sm:py-16">
      <AmbientBackground intensity={0.45} />
      <div className="relative">
        <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.5 }}>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">YOUR JOURNEY</p>
          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><h1 className="text-[clamp(3.4rem,9vw,7rem)] font-black leading-[0.86] tracking-[-0.075em]">WHAT<br />YOU MADE.</h1><p className="mt-6 max-w-xl text-sm leading-6 text-[var(--muted)]">The moments you actually lived, kept as a record of your answers.</p></div>
            <div className="sm:text-right"><p className="text-5xl font-black tracking-[-0.07em]">{count}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">moments made</p></div>
          </div>
        </motion.div>
        <div className="mt-14">{children}</div>
        <Link href="/" className="mt-12 block border-t border-[var(--line)] pt-6 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted)] transition-opacity hover:opacity-60">BACK TO TODAY&apos;S MOMENT →</Link>
      </div>
    </main>
  );
}

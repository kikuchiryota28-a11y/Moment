"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { AmbientBackground } from "@/components/v3/MotionSystem";

export function WorldRevealMotion({ prompt, children, empty }: { prompt: string; children: ReactNode; empty: boolean }) {
  const reduce = useReducedMotion();
  return (
    <main className="relative min-h-[calc(100vh-7rem)] overflow-hidden py-6 sm:py-10">
      <AmbientBackground intensity={0.8} />
      <Link href="/" className="relative text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)] transition-opacity hover:opacity-60">← MOMENT</Link>
      <section className="relative mt-16">
        <motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">WORLD REVEAL</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.9rem,8vw,6.8rem)] font-black leading-[0.86] tracking-[-0.07em]">SAME QUESTION.<br />DIFFERENT REALITY.</h1>
          <p className="mt-7 max-w-2xl text-sm leading-6 text-[var(--muted)]">{prompt}</p>
        </motion.div>
        <div className="mt-14">{empty ? <div className="rounded-[30px] border border-dashed border-[var(--line)] p-9"><p className="text-xl font-black tracking-[-0.03em]">The world is still forming.</p><p className="mt-2 text-sm text-[var(--muted)]">Come back after more people have answered.</p></div> : children}</div>
        {!empty && <motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: reduce ? 0 : 0.55 }} className="mt-12 border-t border-[var(--line)] pt-8"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">THAT&apos;S TODAY&apos;S MOMENT.</p><p className="mt-3 text-3xl font-black tracking-[-0.05em]">TOMORROW IS UNKNOWN.</p></motion.div>}
      </section>
    </main>
  );
}

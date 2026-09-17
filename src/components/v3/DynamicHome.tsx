"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";
import { AmbientBackground, NumericTicker, ParallaxText } from "@/components/v3/MotionSystem";

type Props = { id: string; prompt: string; participantCount: number; status: string; myResultId: string | null };

export function DynamicHome({ id, prompt, participantCount, status, myResultId }: Props) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [starting, setStarting] = useState(false);
  const [entered, setEntered] = useState(Boolean(myResultId));
  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(status);

  async function enter() {
    if (myResultId) {
      router.push(`/moment/${id}`);
      return;
    }
    if (live) {
      setEntered(true);
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 650);
      return;
    }
    if (starting) return;
    setStarting(true);
    const result = await startTodayMoment(id);
    if (result.success) {
      setEntered(true);
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 700);
    } else {
      setStarting(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-7rem)] overflow-hidden py-8 sm:py-14">
      <AmbientBackground />
      <div className="relative mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.28em]">MOMENT</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{live ? "LIVE NOW" : "WAITING"}</p>
        </header>

        <section className="grid min-h-[calc(100vh-11rem)] items-center py-16 sm:py-20">
          <div>
            <ParallaxText distance={9}>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--accent)]">RIGHT NOW, SOMEWHERE IN THE WORLD...</p>
              <h1 className="mt-7 max-w-4xl text-[clamp(3.4rem,10vw,8rem)] font-black leading-[0.86] tracking-[-0.075em]">
                TODAY&apos;S<br />MOMENT.
              </h1>
            </ParallaxText>

            <motion.div initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: entered ? 0.35 : 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.55, delay: 0.08 }} className="mt-12 max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">THE QUESTION</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-black leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">{prompt}</h2>
            </motion.div>

            <motion.div layout className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" animate={entered ? { scale: 1.015 } : { scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 28 }}>
              <motion.button type="button" onClick={() => void enter()} disabled={starting} layoutId="moment-enter" whileTap={reduce ? undefined : { scale: 0.97 }} className="group relative overflow-hidden rounded-full bg-[var(--ink)] px-8 py-5 text-sm font-black tracking-[0.08em] text-[var(--bg)] disabled:opacity-70 sm:px-10">
                <motion.span className="absolute inset-0 rounded-full bg-[var(--accent)]" initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: entered ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }} />
                <span className="relative">{starting ? "ENTERING…" : entered ? "YOU'RE IN" : "ENTER"}</span>
              </motion.button>

              <div className="max-w-[15rem] text-left sm:text-right">
                <p className="text-3xl font-black tracking-[-0.05em] sm:text-4xl"><NumericTicker value={participantCount.toLocaleString()} /></p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">people are in this Moment.</p>
              </div>
            </motion.div>
          </div>
        </section>

        <motion.div initial={false} animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }} className="pointer-events-none fixed inset-0 z-40" transition={{ duration: reduce ? 0 : 0.55 }}>
          <div className="absolute inset-0 bg-[var(--bg)]" />
          <div className="relative flex h-full items-center justify-center"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--muted)]">MOMENT</p><p className="mt-4 text-5xl font-black tracking-[-0.07em]">YOU&apos;RE IN.</p></div></div>
        </motion.div>

        <div className="mt-10 flex items-center justify-between border-t border-[var(--line)] pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          <Link href="/journey" className="transition-opacity hover:opacity-60">YOUR JOURNEY</Link>
          <span>SAME QUESTION. DIFFERENT REALITY.</span>
        </div>
      </div>
    </main>
  );
}

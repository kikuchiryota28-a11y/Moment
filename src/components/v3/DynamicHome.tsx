"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";
import { HighEndWorldView } from "@/components/v3/HighEndWorldView";
import { ShaderCard } from "@/components/v3/ShaderCard";

 type Props = {
  id: string;
  prompt: string;
  participantCount: number;
  status: string;
  myResultId: string | null;
};

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
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 900);
      return;
    }

    if (starting) return;
    setStarting(true);
    const result = await startTodayMoment(id);
    if (result.success) {
      setEntered(true);
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 900);
    } else {
      setStarting(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-7rem)] overflow-hidden py-5 sm:py-8">
      <HighEndWorldView active={entered} />

      <motion.div
        className="pointer-events-none fixed inset-0 z-30 bg-neutral-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 0.96 : 0 }}
        transition={{ duration: reduce ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col px-1 sm:px-4">
        <header className="flex items-center justify-between py-3">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black uppercase tracking-[0.3em]"
          >
            MOMENT
          </motion.p>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]" />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{live ? "LIVE NOW" : "WAITING"}</p>
          </div>
        </header>

        <section className="flex flex-1 items-center py-10 sm:py-14">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_0.82fr] lg:gap-16">
            <div className="order-2 lg:order-1">
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -24 }}
                animate={{ opacity: entered ? 0 : 1, x: 0 }}
                transition={{ type: "spring", stiffness: 130, damping: 22, delay: 0.05 }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--accent)]">
                  RIGHT NOW, SOMEWHERE IN THE WORLD
                </p>
                <h1 className="mt-5 max-w-3xl text-[clamp(4rem,11vw,9.5rem)] font-black leading-[0.78] tracking-[-0.09em]">
                  TODAY&apos;S<br />MOMENT.
                </h1>
                <div className="mt-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  <span className="h-px w-12 bg-[var(--line)]" />
                  SAME QUESTION. DIFFERENT REALITY.
                </div>
              </motion.div>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: entered ? 0 : 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 24, delay: 0.16 }}
                className="mt-12 max-w-xl"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--muted)]">THE QUESTION</p>
                <p className="mt-3 text-xl font-medium leading-[1.05] tracking-[-0.035em] sm:text-2xl">{prompt}</p>
              </motion.div>
            </div>

            <motion.div
              className="order-1 lg:order-2"
              initial={reduce ? false : { opacity: 0, scale: 0.94, y: 22 }}
              animate={{ opacity: entered ? 0 : 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.1 }}
            >
              <ShaderCard
                prompt={prompt}
                participantCount={participantCount}
                onEnter={() => void enter()}
                entering={starting || entered}
              />
            </motion.div>
          </div>
        </section>

        <motion.footer
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: entered ? 0 : 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex items-center justify-between border-t border-[var(--line)] py-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]"
        >
          <Link href="/journey" className="transition-opacity hover:opacity-60">YOUR JOURNEY</Link>
          <span>{new Date().getFullYear()} / MOMENT</span>
        </motion.footer>
      </div>

      <motion.div
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        initial={false}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.3, delay: entered ? 0.35 : 0 }}
      >
        <motion.div
          initial={false}
          animate={entered ? { scale: [0.65, 1, 1.08], opacity: [0, 1, 1, 0] } : { scale: 0.65, opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.9, times: [0, 0.35, 0.75, 1], ease: [0.16, 1, 0.3, 1] }}
          className="absolute h-44 w-44 rounded-full border border-white/20 bg-white/5 blur-[1px]"
        />
        <div className="relative text-center text-white">
          <p className="text-[9px] font-bold uppercase tracking-[0.34em] text-white/45">MOMENT</p>
          <p className="mt-4 text-5xl font-medium tracking-[-0.07em]">YOU&apos;RE IN.</p>
        </div>
      </motion.div>
    </main>
  );
}

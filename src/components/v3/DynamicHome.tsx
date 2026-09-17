"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";

const ImmersiveWorldCanvas = dynamic(
  () => import("@/components/v3/ImmersiveWorldCanvas").then((mod) => mod.ImmersiveWorldCanvas),
  { ssr: false },
);

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
  const [entering, setEntering] = useState(false);
  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(status);

  async function enter() {
    if (entering) return;
    if (myResultId) {
      setEntering(true);
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 650);
      return;
    }
    if (live) {
      setEntering(true);
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 900);
      return;
    }

    setEntering(true);
    const result = await startTodayMoment(id);
    if (result.success) {
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 900);
    } else {
      setEntering(false);
    }
  }

  return (
    <main className="relative left-1/2 min-h-[calc(100vh-7rem)] w-screen -translate-x-1/2 overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.8),transparent_38%),radial-gradient(circle_at_18%_18%,rgba(215,231,223,.24),transparent_28%),radial-gradient(circle_at_82%_75%,rgba(231,210,186,.2),transparent_30%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(20,24,22,.08)_100%)]" />
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-40 bg-neutral-950"
        animate={{ opacity: entering ? 0.94 : 0 }}
        transition={{ duration: reduce ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1500px] flex-col px-5 sm:px-8 lg:px-12">
        <header className="relative z-30 flex items-center justify-between py-5 sm:py-7">
          <p className="text-[11px] font-black uppercase tracking-[0.34em]">MOMENT</p>
          <div className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]" />
            {live ? "LIVE NOW" : "WAITING"}
          </div>
        </header>

        <section className="relative flex flex-1 items-center justify-center py-4 sm:py-8">
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-visible">
            <motion.h1
              initial={reduce ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: entering ? 0 : 0.9, scale: entering ? 1.06 : 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 24 }}
              className="absolute w-[120vw] text-center text-[clamp(4rem,13vw,12.5rem)] font-black uppercase leading-[0.78] tracking-[-0.105em] text-neutral-950"
            >
              SAME QUESTION.<br />DIFFERENT REALITY.
            </motion.h1>
          </div>

          <ImmersiveWorldCanvas active={entering} />

          <motion.div
            className="relative z-20 w-full max-w-[430px] [perspective:1400px]"
            initial={reduce ? false : { opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: entering ? 0 : 1, y: 0, scale: entering ? 1.08 : 1 }}
            transition={{ type: "spring", stiffness: 105, damping: 22, delay: 0.12 }}
          >
            <motion.div
              whileHover={reduce ? undefined : { y: -6, rotateX: -1.5 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="relative overflow-hidden rounded-[34px] border border-white/35 bg-white/40 p-6 shadow-[0_32px_100px_rgba(20,24,22,.18),inset_0_1px_0_rgba(255,255,255,.8)] backdrop-blur-2xl sm:rounded-[40px] sm:p-8"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,.5),transparent_28%,rgba(255,255,255,.1)_52%,transparent_72%)]" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/35 blur-3xl" />

              <div className="relative z-10 flex min-h-[390px] flex-col justify-between sm:min-h-[430px]">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-neutral-900/55">TODAY&apos;S MOMENT</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900/35">01 / 01</p>
                </div>

                <div className="py-10">
                  <p className="text-[9px] font-black uppercase tracking-[0.24em] text-neutral-900/40">THE QUESTION</p>
                  <h2 className="mt-4 text-[clamp(2rem,6vw,3.55rem)] font-medium leading-[0.93] tracking-[-0.065em] text-neutral-950">
                    {prompt}
                  </h2>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-medium tracking-[-0.05em]">{participantCount.toLocaleString()}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-900/40">people are in</p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => void enter()}
                    disabled={entering}
                    whileTap={reduce ? undefined : { scale: 0.92 }}
                    className="rounded-full border border-neutral-950/10 bg-neutral-950 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,.16)] transition-opacity disabled:opacity-70"
                  >
                    {entering ? "ENTERING" : "ENTER →"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-25 hidden items-end justify-between sm:flex">
            <p className="max-w-[280px] text-[9px] font-bold uppercase leading-[1.6] tracking-[0.18em] text-[var(--muted)]">
              ONE QUESTION.<br />THOUSANDS OF REALITIES.
            </p>
            <p className="text-right text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
              MOVE THROUGH<br />THE MOMENT.
            </p>
          </div>
        </section>

        <footer className="relative z-30 flex items-center justify-between border-t border-black/10 py-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
          <Link href="/journey" className="transition-opacity hover:opacity-55">YOUR JOURNEY</Link>
          <span>{new Date().getFullYear()} / MOMENT</span>
        </footer>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
        animate={{ opacity: entering ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.25, delay: entering ? 0.22 : 0 }}
      >
        <motion.div
          animate={entering ? { scale: [0.55, 1, 2.8], opacity: [0, 0.75, 0] } : { scale: 0.55, opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="h-36 w-36 rounded-full border border-white/30 bg-white/10 shadow-[0_0_100px_rgba(255,255,255,.35)] backdrop-blur-sm"
        />
        <p className="absolute text-[10px] font-black uppercase tracking-[0.4em] text-white">YOU&apos;RE IN.</p>
      </motion.div>
    </main>
  );
}

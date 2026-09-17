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
    setEntering(true);
    if (myResultId || live) {
      window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 900);
      return;
    }
    const result = await startTodayMoment(id);
    if (result.success) window.setTimeout(() => router.push(`/moment/${id}`), reduce ? 0 : 900);
    else setEntering(false);
  }

  return (
    <main className="relative left-1/2 min-h-[calc(100vh-7rem)] w-screen -translate-x-1/2 overflow-hidden bg-[#f3f1ec] text-[#111311]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,.96),transparent_32%),radial-gradient(circle_at_12%_20%,rgba(205,224,217,.35),transparent_30%),radial-gradient(circle_at_88%_76%,rgba(233,207,178,.3),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(17,19,17,.16)_0.55px,transparent_0.55px)] [background-size:8px_8px]" />

      <motion.div className="pointer-events-none absolute inset-0 z-[60] bg-[#111311]" animate={{ opacity: entering ? 0.96 : 0 }} transition={{ duration: reduce ? 0 : 0.8 }} />

      <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-[1600px] flex-col px-5 sm:px-8 lg:px-12">
        <header className="relative z-50 flex items-center justify-between py-5 sm:py-7">
          <p className="text-[11px] font-black uppercase tracking-[0.36em]">MOMENT</p>
          <div className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.24em] text-black/45">
            <span className="h-1.5 w-1.5 rounded-full bg-[#687d75] shadow-[0_0_16px_rgba(104,125,117,.7)]" />
            {live ? "LIVE NOW" : "TODAY"}
          </div>
        </header>

        <section className="relative flex flex-1 items-center justify-center overflow-visible py-2 sm:py-5">
          <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center overflow-visible">
            <motion.div
              animate={{ x: entering ? 0 : 0, scale: entering ? 1.08 : 1, opacity: entering ? 0 : 1 }}
              transition={{ type: "spring", stiffness: 70, damping: 22 }}
              className="absolute top-[7%] w-[150vw] text-center text-[clamp(4.5rem,15vw,15rem)] font-black uppercase leading-[0.73] tracking-[-0.115em] text-black/[0.095] select-none"
            >
              SAME QUESTION.<br />DIFFERENT REALITY.
            </motion.div>
          </div>

          <ImmersiveWorldCanvas active={entering} />

          <div className="pointer-events-none absolute inset-0 z-[18] flex items-center justify-center">
            <div className="absolute h-[min(65vw,760px)] w-[min(65vw,760px)] rounded-full bg-white/30 blur-[90px]" />
          </div>

          <motion.div
            className="relative z-[30] w-full max-w-[500px] [perspective:1600px] sm:translate-y-[8vh]"
            initial={reduce ? false : { opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: entering ? 0 : 1, y: entering ? -30 : 0, scale: entering ? 1.12 : 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 22, delay: 0.1 }}
          >
            <motion.div
              whileHover={reduce ? undefined : { y: -7, rotateX: -2, rotateY: 1 }}
              transition={{ type: "spring", stiffness: 210, damping: 19 }}
              className="relative overflow-hidden rounded-[38px] border border-white/55 bg-white/[0.27] p-6 shadow-[0_40px_120px_rgba(20,24,22,.17),inset_0_1px_0_rgba(255,255,255,.95),inset_0_-1px_0_rgba(255,255,255,.2)] backdrop-blur-2xl sm:rounded-[44px] sm:p-8"
              style={{ transformStyle: "preserve-3d", WebkitBackdropFilter: "blur(40px)" }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.6),transparent_24%,rgba(255,255,255,.08)_52%,transparent_78%)]" />
              <div className="pointer-events-none absolute -left-28 -top-28 h-64 w-64 rounded-full bg-white/45 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-[#dce8e3]/35 blur-3xl" />

              <div className="relative z-10 flex min-h-[340px] flex-col justify-between sm:min-h-[390px]">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/55">TODAY&apos;S MOMENT</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">01 / 01</p>
                </div>

                <div className="py-10">
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-black/38">THE QUESTION</p>
                  <h1 className="mt-4 max-w-[440px] text-[clamp(2rem,5.5vw,3.6rem)] font-medium leading-[0.94] tracking-[-0.065em] text-black">{prompt}</h1>
                </div>

                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-2xl font-medium tracking-[-0.05em]">{participantCount.toLocaleString()}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">people are in</p>
                  </div>
                  <motion.button type="button" onClick={() => void enter()} disabled={entering} whileTap={reduce ? undefined : { scale: 0.9 }} className="group relative overflow-hidden rounded-full bg-[#111311] px-7 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_14px_36px_rgba(0,0,0,.2)]">
                    <span className="relative z-10">{entering ? "ENTERING" : "ENTER →"}</span>
                    <span className="absolute inset-0 -translate-x-full bg-white/15 transition-transform duration-500 group-hover:translate-x-0" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[35] hidden items-end justify-between sm:flex">
            <p className="max-w-[300px] text-[9px] font-bold uppercase leading-[1.65] tracking-[0.18em] text-black/35">ONE QUESTION.<br />THOUSANDS OF REALITIES.</p>
            <p className="text-right text-[9px] font-bold uppercase leading-[1.65] tracking-[0.18em] text-black/35">MOVE THROUGH<br />THE MOMENT.</p>
          </div>
        </section>

        <footer className="relative z-50 flex items-center justify-between border-t border-black/10 py-5 text-[9px] font-bold uppercase tracking-[0.18em] text-black/35">
          <Link href="/journey" className="transition-opacity hover:opacity-55">YOUR JOURNEY</Link>
          <span>{new Date().getFullYear()} / MOMENT</span>
        </footer>
      </div>

      <motion.div className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center" animate={{ opacity: entering ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.25, delay: entering ? 0.2 : 0 }}>
        <motion.div animate={entering ? { scale: [0.5, 1, 3.5], opacity: [0, 0.8, 0] } : { scale: 0.5, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.95, ease: [0.16, 1, 0.3, 1] }} className="h-40 w-40 rounded-full border border-white/35 bg-white/10 shadow-[0_0_120px_rgba(255,255,255,.4)] backdrop-blur-md" />
        <p className="absolute text-[10px] font-black uppercase tracking-[0.42em] text-white">YOU&apos;RE IN.</p>
      </motion.div>
    </main>
  );
}

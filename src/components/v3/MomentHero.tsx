"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { PointerEvent } from "react";
import { startTodayMoment } from "@/actions/v3";

type MomentData = {
  id: string;
  prompt: string;
  participantCount: number;
  status: string;
  myResultId: string | null;
};

const spring = { type: "spring", stiffness: 120, damping: 22, mass: 1 } as const;

export function MomentHero({ moment }: { moment: MomentData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sphereX = useSpring(useTransform(px, [-0.5, 0.5], [-16, 16]), spring);
  const sphereY = useSpring(useTransform(py, [-0.5, 0.5], [-12, 12]), spring);
  const cardX = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), spring);
  const cardY = useSpring(useTransform(py, [-0.5, 0.5], [-5, 5]), spring);
  const sphereRotate = useSpring(useTransform(px, [-0.5, 0.5], [-2, 2]), spring);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status);

  const cta = useMemo(() => {
    if (moment.myResultId) return "CONTINUE";
    if (live) return "MAKE YOUR MOMENT";
    if (started) return "WORLD IS FORMING.";
    if (busy) return "STARTING…";
    return "START THE MOMENT";
  }, [busy, live, moment.myResultId, started]);

  const activate = async () => {
    if (busy || started) return;
    if (moment.myResultId || live) {
      router.push(`/moment/${moment.id}`);
      return;
    }
    setBusy(true);
    try {
      const result = await startTodayMoment(moment.id);
      if (result.success) setStarted(true);
    } finally {
      setBusy(false);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      className="relative h-[100dvh] w-full overflow-hidden bg-[#eee9df] text-[#181715]"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      {/* Layer 1 — atmosphere + giant editorial type */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,#faf7f0_0%,#eee9df_48%,#dcd5c9_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(24,23,21,.08),transparent_48%)]" />
        <div className="absolute -left-[18vw] -top-[18vw] h-[55vw] w-[55vw] rounded-full bg-white/55 blur-[110px]" />
        <div className="absolute -bottom-[25vw] -right-[15vw] h-[60vw] w-[60vw] rounded-full bg-[#d8c8b4]/35 blur-[120px]" />
        <div className="moment-noise absolute inset-0 opacity-40" aria-hidden="true" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="select-none whitespace-nowrap text-[clamp(7rem,22vw,25rem)] font-semibold leading-none tracking-[-0.09em] text-black/[0.045]">
            MOMENT
          </div>
        </div>

        <div className="absolute left-5 top-5 text-[10px] font-black uppercase tracking-[0.28em] text-black/55 sm:left-8 sm:top-7 lg:left-10">
          MOMENT
        </div>

        <div className="absolute right-5 top-5 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.18em] text-black/30 sm:right-8 sm:top-7 lg:right-10">
          <span>DAILY</span>
          <span className="h-px w-8 bg-black/15" />
          <span>NOW</span>
        </div>
      </div>

      {/* Layer 2 — the single spatial object */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <motion.div
          className="relative h-[min(68vh,700px)] w-[min(68vh,700px)] sm:h-[min(70vh,760px)] sm:w-[min(70vh,760px)]"
          style={{ x: reducedMotion ? 0 : sphereX, y: reducedMotion ? 0 : sphereY, rotate: reducedMotion ? 0 : sphereRotate }}
        >
          <motion.div
            className="absolute inset-[8%] rounded-full"
            animate={reducedMotion ? undefined : { scale: [1, 1.025, 1], rotate: [0, 2, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle at 34% 25%, rgba(255,255,255,.98) 0%, rgba(255,255,255,.72) 12%, rgba(238,225,207,.86) 32%, rgba(190,170,145,.76) 62%, rgba(116,99,79,.72) 100%)",
              boxShadow:
                "inset 45px 40px 85px rgba(255,255,255,.48), inset -55px -65px 100px rgba(50,42,33,.18), 0 55px 120px rgba(50,42,33,.16)",
            }}
          >
            <div className="absolute inset-[7%] rounded-full border border-white/55 opacity-70" />
            <div className="absolute left-[18%] top-[16%] h-[25%] w-[25%] rounded-full bg-white/50 blur-2xl" />
            <div className="absolute right-[15%] bottom-[18%] h-[32%] w-[32%] rounded-full bg-[#ef6b35]/12 blur-3xl" />
            <motion.div
              className="absolute left-[26%] top-[46%] h-[13%] w-[48%] rounded-full bg-white/25 blur-xl"
              animate={reducedMotion ? undefined : { x: [-10, 14, -10], opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <div className="absolute -bottom-[1%] left-1/2 h-[12%] w-[55%] -translate-x-1/2 rounded-full bg-black/12 blur-3xl" />
        </motion.div>
      </div>

      {/* Layer 3 — one floating glass card, intentionally crossing the sphere */}
      <motion.div
        className="absolute left-1/2 top-[57%] z-20 w-[min(88vw,560px)] -translate-x-1/2 -translate-y-1/2 sm:top-[58%] lg:left-[54%] lg:top-[60%] lg:w-[min(42vw,590px)]"
        style={{ x: reducedMotion ? 0 : cardX, y: reducedMotion ? 0 : cardY }}
        initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...spring, delay: 0.2 }}
      >
        <div className="relative rounded-[30px] border border-white/65 bg-white/[0.22] p-2 shadow-[0_35px_100px_rgba(38,31,23,.18),0_8px_25px_rgba(38,31,23,.1)] backdrop-blur-2xl">
          <div className="rounded-[24px] border border-white/45 bg-white/[0.42] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#ef6b35]">
                  TODAY&apos;S MOMENT
                </p>
                <h1 className="mt-3 max-w-[13ch] text-[clamp(1.7rem,3.3vw,2.65rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
                  {moment.prompt}
                </h1>
              </div>
              <span className="pt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-black/30">
                01
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <p className="max-w-[20rem] text-[11px] leading-5 text-black/42">
                {moment.participantCount.toLocaleString()} people are in this Moment.
              </p>
              <button
                type="button"
                onClick={() => void activate()}
                disabled={busy || started}
                className="group flex h-12 shrink-0 items-center gap-4 rounded-[15px] bg-[#181715] px-4 text-[9px] font-black uppercase tracking-[0.16em] text-[#f7f2e9] shadow-[0_12px_25px_rgba(24,23,21,.2)] transition-transform duration-300 hover:-translate-y-0.5 active:scale-[.98] disabled:opacity-65"
              >
                <span>{cta}</span>
                <span className="text-base transition-transform duration-300 group-hover:translate-x-1">↗</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Layer 4 — atmospheric labels only; navigation itself is the existing floating glass nav */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[92px] z-30 hidden items-center justify-center md:flex">
        <div className="flex items-center gap-3 text-[8px] font-bold uppercase tracking-[0.22em] text-black/25">
          <span className="h-px w-10 bg-black/12" />
          STEP CLOSER
          <span className="h-px w-10 bg-black/12" />
        </div>
      </div>
    </section>
  );
}

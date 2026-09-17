"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { startTodayMoment } from "@/actions/v3";

type MomentData = {
  id: string;
  prompt: string;
  participantCount: number;
  status: string;
  myResultId: string | null;
};

const spring = { type: "spring", stiffness: 150, damping: 24, mass: 0.8 } as const;

export function MomentHero({ moment }: { moment: MomentData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [focused, setFocused] = useState(false);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [2.8, -2.8]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-3.5, 3.5]), spring);
  const glowX = useTransform(px, [-0.5, 0.5], ["42%", "58%"]);
  const glowY = useTransform(py, [-0.5, 0.5], ["42%", "58%"]);

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

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-[#f3eee5] text-[#191816]"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
        setFocused(false);
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-[12vw] top-[4vh] h-[42vw] w-[42vw] rounded-full blur-3xl"
          animate={reducedMotion ? undefined : { x: [0, 35, 0], y: [0, 24, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle, rgba(239,107,53,.16), rgba(239,107,53,0) 68%)" }}
        />
        <motion.div
          className="absolute -right-[10vw] bottom-[2vh] h-[38vw] w-[38vw] rounded-full blur-3xl"
          animate={reducedMotion ? undefined : { x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(circle, rgba(105,122,154,.12), rgba(105,122,154,0) 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.9'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(25,24,22,.06)_100%)]" />
      </div>

      <header className="relative z-30 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-8 lg:px-10">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-black tracking-[0.28em]">MOMENT</span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35 sm:block">/ Daily discovery</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-black/45">
          <span>03</span>
          <span className="h-px w-7 bg-black/15" />
          <span>Today</span>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-76px)] max-w-[1500px] items-center px-5 pb-14 pt-8 sm:px-8 lg:px-10">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(560px,1.18fr)] lg:gap-6">
          <div className="relative z-20 max-w-[580px] lg:pl-[3vw]">
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="mb-6 text-[10px] font-black uppercase tracking-[0.28em] text-[#ef6b35]"
            >
              TODAY&apos;S MOMENT
            </motion.p>

            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.08 }}
              className="max-w-[11ch] text-[clamp(3.25rem,7vw,7rem)] font-semibold leading-[0.86] tracking-[-0.065em]"
            >
              Make
              <br />
              something
              <br />
              happen.
            </motion.h1>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mt-7 max-w-[34rem] text-[15px] leading-7 text-black/48 sm:text-base"
            >
              One question. One small decision. A different reality on the other side.
            </motion.p>

            <div className="mt-9 flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/38">
                {moment.participantCount.toLocaleString()} people in this Moment
              </span>
              <span className="h-px w-8 bg-black/15" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/38">01 / 01</span>
            </div>
          </div>

          <div className="relative flex min-h-[500px] items-center justify-center sm:min-h-[620px] lg:min-h-[720px]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[8%] top-[15%] h-px w-[30%] bg-black/10" />
              <div className="absolute right-[3%] top-[25%] h-px w-[20%] bg-black/8" />
              <div className="absolute bottom-[18%] left-[14%] h-px w-[20%] bg-black/8" />
              <span className="absolute left-[7%] top-[12%] text-[9px] font-bold uppercase tracking-[0.2em] text-black/25">DISCOVER</span>
              <span className="absolute bottom-[15%] right-[5%] text-[9px] font-bold uppercase tracking-[0.2em] text-black/25">FOCUS</span>
            </div>

            <motion.div
              className="relative w-[min(88vw,620px)] [perspective:1400px]"
              style={{ rotateX, rotateY }}
              onHoverStart={() => setFocused(true)}
              onHoverEnd={() => setFocused(false)}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.94, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ ...spring, delay: 0.12 }}
            >
              <motion.div
                className="pointer-events-none absolute -inset-10 rounded-[50px] opacity-80 blur-2xl"
                style={{
                  background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,.92), rgba(239,107,53,.09) 42%, transparent 72%)",
                  x: useTransform(px, [-0.5, 0.5], ["-3%", "3%"]),
                  y: useTransform(py, [-0.5, 0.5], ["-3%", "3%"]),
                }}
              />

              <div className="relative rounded-[34px] p-[1px] shadow-[0_35px_100px_rgba(31,27,21,.13),0_8px_28px_rgba(31,27,21,.08)]"
                style={{ background: "linear-gradient(145deg, rgba(255,255,255,.96), rgba(255,255,255,.34) 42%, rgba(255,255,255,.72))" }}
              >
                <div className="relative overflow-hidden rounded-[33px] bg-white/35 p-5 backdrop-blur-2xl sm:p-7">
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: useTransform([glowX, glowY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,.9), transparent 36%)`) }}
                  />
                  <div className="relative overflow-hidden rounded-[27px] border border-white/75 bg-[#ebe4d8]/75">
                    <div className="relative aspect-[1.18/1] overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,.95),transparent_26%),radial-gradient(circle_at_72%_70%,rgba(239,107,53,.2),transparent_28%),linear-gradient(135deg,#e9e0d2,#cfc5b7)]" />
                      <motion.div
                        className="absolute left-[17%] top-[19%] h-[48%] w-[48%] rounded-full border border-white/65 bg-white/20 shadow-[inset_12px_12px_30px_rgba(255,255,255,.7),inset_-12px_-16px_28px_rgba(78,66,50,.08),0_30px_70px_rgba(67,54,38,.13)] backdrop-blur-sm"
                        animate={reducedMotion ? undefined : { y: [0, -9, 0], x: [0, 6, 0], scale: [1, 1.015, 1] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute bottom-[13%] right-[13%] h-[22%] w-[22%] rounded-full border border-white/55 bg-[#ef6b35]/10 backdrop-blur-md"
                        animate={reducedMotion ? undefined : { y: [0, 10, 0], x: [0, -5, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_35%,rgba(255,255,255,.22)_50%,transparent_65%)] opacity-70" />
                      <span className="absolute left-5 top-5 text-[9px] font-black uppercase tracking-[0.24em] text-black/40">A MOMENT IS OPEN</span>
                      <span className="absolute bottom-5 right-5 text-[9px] font-bold uppercase tracking-[0.18em] text-black/30">REAL / NOW</span>
                    </div>

                    <div className="relative border-t border-white/65 bg-white/40 p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-5">
                        <div className="max-w-[34rem]">
                          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#ef6b35]">THE QUESTION</p>
                          <h2 className="mt-3 text-[clamp(1.45rem,3vw,2.4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
                            {moment.prompt}
                          </h2>
                        </div>
                        <span className="hidden pt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-black/30 sm:block">TODAY</span>
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <motion.button
                          type="button"
                          onClick={() => void activate()}
                          disabled={busy || started}
                          whileTap={reducedMotion ? undefined : { scale: 0.975 }}
                          className="group relative flex h-14 flex-1 items-center justify-between overflow-hidden rounded-[17px] bg-[#191816] px-5 text-left text-[#f8f4ec] shadow-[0_10px_25px_rgba(25,24,22,.16)] transition-shadow hover:shadow-[0_16px_35px_rgba(25,24,22,.2)] disabled:cursor-default disabled:opacity-70"
                        >
                          <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.18em]">{cta}</span>
                          <span className="relative z-10 text-lg transition-transform duration-300 group-hover:translate-x-1">↗</span>
                          <span className="absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-white/10 blur-xl transition-transform duration-700 group-hover:translate-x-[180%]" />
                        </motion.button>
                        <div className="flex h-14 items-center justify-center rounded-[15px] border border-black/8 bg-white/30 px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-black/38">
                          {focused ? "YOU ARE CLOSE" : "MOVE CLOSER"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="pointer-events-none absolute bottom-[3%] left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-black/25 md:flex">
              <span className="h-px w-8 bg-black/12" />
              SCROLL TO DISCOVER
              <span className="h-px w-8 bg-black/12" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-black/7 bg-white/15 px-5 py-14 backdrop-blur-sm sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ef6b35]">DISCOVER / 01</p>
            <p className="mt-4 max-w-[18rem] text-[clamp(1.9rem,4vw,3.6rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              Your next experience starts smaller than you think.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["01", "NOTICE", "Something catches your attention."],
              ["02", "DECIDE", "You choose whether to step closer."],
              ["03", "TRY", "One action turns a thought into reality."],
            ].map(([n, title, copy]) => (
              <div key={n} className="rounded-[22px] border border-black/8 bg-white/28 p-5 backdrop-blur-xl">
                <span className="text-[9px] font-black tracking-[0.2em] text-black/25">{n}</span>
                <h3 className="mt-7 text-[11px] font-black uppercase tracking-[0.18em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-black/42">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

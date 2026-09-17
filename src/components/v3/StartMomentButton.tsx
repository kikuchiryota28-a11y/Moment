"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";

export function StartMomentButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const reduce = useReducedMotion();

  async function go() {
    if (busy || done) return;
    setBusy(true);
    const result = await startTodayMoment(id);
    setDone(result.success);
    setBusy(false);
  }

  return (
    <motion.button
      type="button"
      onClick={() => void go()}
      disabled={busy || done}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className="relative w-full overflow-hidden rounded-full bg-[var(--ink)] px-5 py-4 text-sm font-black tracking-[0.08em] text-[var(--bg)] disabled:opacity-60"
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-[var(--accent)]"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: done ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="relative">{done ? "WORLD IS FORMING." : busy ? "STARTING…" : "ENTER"}</span>
    </motion.button>
  );
}

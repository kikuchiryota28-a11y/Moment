"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";
import { Button } from "@/components/ui/Button";
import { isSuccess } from "@/lib/action-result";

type MomentData = { id: string; prompt: string; participantCount: number; status: string; myResultId: string | null };
type HomeState = "empty" | "error";
type MomentState = "prepared" | "active" | "closed" | "recorded";

function getMomentState(moment: MomentData): MomentState {
  if (moment.myResultId) return "recorded";
  if (["ENDED", "ARCHIVE"].includes(moment.status)) return "closed";
  if (["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status)) return "active";
  return "prepared";
}

export function MomentHero({ moment, state }: { moment?: MomentData; state?: HomeState }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const momentState = moment ? getMomentState(moment) : null;

  const activate = async () => {
    if (!moment || busy) return;
    if (momentState === "recorded" || momentState === "closed") return router.push(`/moment/${moment.id}/reveal`);
    if (momentState === "active") return router.push(`/moment/${moment.id}`);
    setBusy(true); setError(null);
    try {
      const result = await startTodayMoment(moment.id);
      if (isSuccess(result)) router.push(`/moment/${moment.id}`);
      else setError(result.error ?? "Couldn't open this Moment.");
    } catch { setError("Couldn't open this Moment."); }
    finally { setBusy(false); }
  };

  const title = moment?.prompt ?? (state === "empty" ? "Not yet." : "Unavailable.");
  const label = momentState === "recorded" ? "See result" : momentState === "closed" ? "See the world" : momentState === "active" ? "Enter" : "Enter";

  return (
    <main className="moment-container flex min-h-[100dvh] flex-col py-6 pb-28 md:py-8 md:pb-10">
      <header className="flex items-center justify-between pb-4">
        <span className="text-sm font-semibold tracking-[-0.02em]">MOMENT</span>
        <span className="text-xs font-medium text-[var(--color-muted-ink)]">Today</span>
      </header>

      <div className="flex flex-1 items-center py-10 md:py-16">
        <section className="w-full max-w-4xl">
          <p className="moment-eyebrow text-[var(--color-muted-ink)]">Today</p>
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .28, ease: [0.2, 0, 0, 1] }}
            className="moment-display mt-5 max-w-[11ch] text-[clamp(3.4rem,8vw,8rem)]"
          >
            {title}
          </motion.h1>

          {moment && (
            <p className="mt-6 text-sm text-[var(--color-muted-ink)]">
              {moment.participantCount.toLocaleString()} entered
            </p>
          )}

          <div className="mt-8 flex items-center gap-4">
            <Button size="lg" onClick={() => void activate()} loading={busy} disabled={!moment || state === "empty"}>
              {label}
            </Button>
            {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}
          </div>
        </section>
      </div>

      <footer className="flex items-center justify-between pt-4 text-xs text-[var(--color-muted-ink)]">
        <span>BE WHAT HAPPENS.</span>
        <span className="hidden sm:inline">MOMENT</span>
      </footer>
    </main>
  );
}
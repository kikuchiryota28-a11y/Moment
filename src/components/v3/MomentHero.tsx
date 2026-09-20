"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";
import { Button } from "@/components/ui/Button";
import { Badge, PhaseBadge } from "@/components/ui/Badge";
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
    } catch {
      setError("Couldn't open this Moment.");
    } finally {
      setBusy(false);
    }
  };

  const title = moment?.prompt ?? (state === "empty" ? "Not yet." : "Unavailable.");
  const label =
    momentState === "recorded" ? "See result" :
    momentState === "closed" ? "See the world" :
    momentState === "active" ? "Enter" : "Enter Moment";

  return (
    <main className="moment-container flex min-h-[100dvh] flex-col py-6 pb-28 md:py-8 md:pb-10">
      <header className="flex items-center justify-between border-b border-[var(--color-line-value)] pb-4">
        <span className="text-sm font-semibold tracking-[-0.02em]">MOMENT</span>
        <span className="text-xs font-medium text-[var(--color-muted-ink-value)]">Today</span>
      </header>

      <div className="flex flex-1 items-center py-10 md:py-16">
        <section className="w-full max-w-5xl">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-[var(--color-primary-value)]" aria-hidden="true" />
            <span className="moment-eyebrow text-[var(--color-muted-ink-value)]">Today’s Moment</span>
          </div>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .35, ease: [0.2, 0, 0, 1] }}
            className="moment-display mt-6 max-w-[12ch] text-[clamp(3.25rem,8vw,7.5rem)]"
          >
            {title}
          </motion.h1>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {moment && <Badge variant="outline">{moment.participantCount.toLocaleString()} entered</Badge>}
            {momentState && <PhaseBadge phase={momentState === "prepared" ? "discover" : momentState === "active" ? "enter" : momentState === "recorded" ? "result" : "closed"} size="sm" />}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <Button size="lg" onClick={() => void activate()} loading={busy} disabled={!moment || state === "empty"}>
              {label}
            </Button>
            {error && <p role="alert" className="text-sm text-[var(--color-danger-value)]">{error}</p>}
          </div>
        </section>
      </div>

      <footer className="flex items-center justify-between border-t border-[var(--color-line-value)] pt-4 text-xs text-[var(--color-muted-ink-value)]">
        <span>BE WHAT HAPPENS.</span>
        <span className="hidden sm:inline">MOMENT</span>
      </footer>
    </main>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";
import { Button } from "@/components/ui/Button";
import { Badge, PhaseBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
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
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const momentState = moment ? getMomentState(moment) : null;

  const activate = async () => {
    if (!moment || busy) return;
    if (momentState === "recorded" || momentState === "closed") return router.push(`/moment/${moment.id}/reveal`);
    if (momentState === "active") return router.push(`/moment/${moment.id}`);
    setBusy(true); setError(null);
    try {
      const result = await startTodayMoment(moment.id);
      if (isSuccess(result)) router.push(`/moment/${moment.id}`);
      else setError(result.error ?? "Could not open this Moment.");
    } catch { setError("Could not open this Moment. Try again."); }
    finally { setBusy(false); }
  };

  const title = moment?.prompt ?? (state === "empty" ? "Nothing to enter yet." : "The Moment is unavailable.");
  const description = moment ? "One question. One action. Something you can actually experience." : state === "empty" ? "The next invitation will appear here when it is ready." : "We could not load this Moment. Try again.";
  const label = momentState === "recorded" ? "See your result" : momentState === "closed" ? "See the world" : momentState === "active" ? "Enter Moment" : "Start Moment";

  return (
    <main className="moment-container py-8 pb-28 md:py-12 md:pb-16">
      <header className="flex items-center justify-between border-b border-[var(--color-line-value)] pb-5">
        <span className="font-semibold tracking-[-0.02em]">MOMENT</span>
        <span className="moment-eyebrow text-[var(--color-muted-ink-value)]">Today</span>
      </header>

      <div className="grid min-h-[calc(100dvh-150px)] items-center gap-12 py-16 md:grid-cols-[minmax(0,1.35fr)_360px] md:py-24">
        <section>
          <div className="moment-eyebrow flex items-center gap-3 text-[var(--color-primary-value)]">
            <span className="h-px w-8 bg-[var(--color-primary-value)]" aria-hidden="true" />
            A daily invitation
          </div>

          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .45, ease: [0.2,0,0,1] }}
            className="moment-display mt-7 max-w-[10ch] text-[clamp(3.25rem,8vw,8.5rem)]"
          >
            {title}
          </motion.h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-[var(--color-muted-ink-value)]">{description}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {moment && <Badge variant="outline">{moment.participantCount.toLocaleString()} people are in this Moment</Badge>}
            {momentState && <PhaseBadge phase={momentState === "prepared" ? "discover" : momentState === "active" ? "enter" : momentState === "recorded" ? "result" : "closed"} size="sm" />}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" onClick={() => void activate()} loading={busy} disabled={!moment || state === "empty"}>
              {label}
            </Button>
            {error && <p role="alert" className="text-sm text-[var(--color-danger-value)]">{error}</p>}
          </div>
        </section>

        <aside className="md:justify-self-end md:w-full">
          <div className="rounded-[28px] bg-[var(--color-surface-container-value)] p-6 md:p-7">
            <p className="moment-eyebrow text-[var(--color-muted-ink-value)]">How MOMENT works</p>
            <ol className="mt-6 space-y-5">
              {[
                ["01","DISCOVER","Notice something worth doing."],
                ["02","ENTER","Step into the prompt."],
                ["03","RESULT","Your action becomes part of the world."],
                ["04","BRANCH","Tomorrow can grow from what happened today."],
              ].map(([n,phase,copy]) => (
                <li key={phase} className="grid grid-cols-[32px_1fr] gap-3">
                  <span className="font-mono text-xs text-[var(--color-muted-ink-value)]">{n}</span>
                  <div><p className="text-sm font-semibold">{phase}</p><p className="mt-1 text-sm leading-5 text-[var(--color-muted-ink-value)]">{copy}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line-value)] pt-5 text-xs text-[var(--color-muted-ink-value)]">
        <span>DON'T JUST WATCH WHAT HAPPENS. BE WHAT HAPPENS.</span>
        <span>Designed for real life.</span>
      </footer>
    </main>
  );
}

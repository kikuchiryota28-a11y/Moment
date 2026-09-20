"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";
import { Button } from "@/components/ui/Button";
import { Badge, PhaseBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";
import { useCanvas3D } from "@/components/layout/CanvasProvider";

type MomentData = {
  id: string;
  prompt: string;
  participantCount: number;
  status: string;
  myResultId: string | null;
};

type HomeState = "empty" | "error";

type MomentState = "prepared" | "active" | "closed" | "recorded";

function getMomentState(moment: MomentData): MomentState {
  if (moment.myResultId) return "recorded";
  if (["ENDED", "ARCHIVE"].includes(moment.status)) return "closed";
  if (["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status)) return "active";
  return "prepared";
}

function getActionLabel(state: MomentState, busy: boolean) {
  if (busy) return "Opening...";
  if (state === "recorded") return "See your Moment";
  if (state === "closed") return "See the world";
  if (state === "active") return "Try this";
  return "Start the Moment";
}

function getPhase(momentState: MomentState): "discover" | "enter" | "action" | "result" | "branch" {
  if (momentState === "active") return "enter";
  if (momentState === "recorded") return "branch";
  if (momentState === "closed") return "branch";
  return "discover";
}

export function MomentHero({ moment, state }: { moment?: MomentData; state?: HomeState }) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { setPhase, setMomentData } = useCanvas3D();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const momentState = moment ? getMomentState(moment) : null;
  const actionLabel = momentState ? getActionLabel(momentState, busy) : state === "empty" ? "Come back tomorrow" : "Try again";
  const phase = moment && momentState ? getPhase(momentState) : "discover";

  // Update 3D scene phase and data
  setPhase(phase);
  setMomentData(moment ? {
    id: moment.id,
    prompt: moment.prompt,
    participantCount: moment.participantCount,
    status: moment.status,
    myResultId: moment.myResultId,
  } : null);

  const activate = async () => {
    if (!moment || busy || state === "empty") {
      if (state === "error") window.location.reload();
      return;
    }

    setActionError(null);

    if (momentState === "recorded" || momentState === "closed") {
      router.push(`/moment/${moment.id}/reveal`);
      return;
    }

    if (momentState === "active") {
      router.push(`/moment/${moment.id}`);
      return;
    }

    setBusy(true);
    try {
      const result = await startTodayMoment(moment.id);
      if (result.success) {
        router.push(`/moment/${moment.id}`);
      } else {
        setActionError(result.error);
      }
    } catch {
      setActionError("The Moment could not be opened. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="relative min-h-[100dvh] bg-[var(--color-canvas)]">
      <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-20">
        <header className="flex items-center justify-between mb-12">
          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-accent)]">
            MOMENT<span className="text-[var(--color-accent)]">.</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-ink)]">Daily / now</span>
        </header>

        <div className="lg:grid lg:grid-cols-[1fr_1.5fr] lg:gap-12 lg:items-start">
          <aside className="hidden lg:block">
            <div className="border-l border-[var(--color-line)] pl-6">
              <Badge variant="outline" className="mb-4">
                A daily invitation
              </Badge>
              <p className="max-w-[10rem] text-[var(--color-muted-ink)] leading-6">
                One prompt. Something real to notice. An action you take yourself.
              </p>
            </div>
          </aside>

          <main className="flex flex-col justify-center lg:flex-none">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
              <span className="h-px w-8 bg-[var(--color-accent)]" aria-hidden="true" />
              {moment ? "Today's Moment" : state === "empty" ? "Between Moments" : "Connection interrupted"}
            </div>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="mt-7 max-w-[10ch] text-[clamp(3.5rem,8vw,9rem)] font-medium leading-[0.85] tracking-[-0.07em] font-[var(--font-display)]">
                {moment?.prompt ?? (state === "empty" ? "The next thing is still becoming." : "Today's Moment is out of reach.")}
              </h1>
            </motion.div>

            <div className="mt-10 flex max-w-[35rem] items-start gap-4 border-t border-[var(--color-line)] pt-5 sm:mt-14 sm:gap-8">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
              <p className="max-w-[28rem] text-base leading-7 text-[var(--color-muted-ink)]">
                {moment
                  ? "Take this prompt with you. The experience starts when you leave this screen."
                  : state === "empty"
                  ? "There is no Moment to enter right now. Your next invitation will appear here."
                  : "We could not reach the Moment. Reload the space and try again."}
              </p>
            </div>
          </main>

          <aside className="mt-12 lg:mt-0 lg:self-start">
            {moment && momentState ? (
              <Card variant="interactive" className="lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <PhaseBadge phase={phase === "branch" ? (momentState === "recorded" ? "completed" : "closed") : phase} size="md" className="mb-3" />
                <p className="text-base leading-6 text-[var(--color-muted-ink)] mb-6">
                  {moment.participantCount.toLocaleString()} {moment.participantCount === 1 ? "person" : "people"} are carrying this question today.
                </p>
                <Button
                  onClick={() => void activate()}
                  disabled={busy}
                  fullWidth
                  loading={busy}
                  size="lg"
                >
                  {actionLabel}
                </Button>
                {actionError && <p role="alert" className="mt-3 text-sm font-medium text-[var(--color-danger)]">{actionError}</p>}
              </Card>
            ) : (
              <Card variant="outlined" className="lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <Badge variant="outline" className="mb-3">
                  {state === "empty" ? "No action needed" : "Something went wrong"}
                </Badge>
                <Button
                  onClick={() => void activate()}
                  disabled={state === "empty"}
                  fullWidth
                  variant="ghost"
                  size="lg"
                >
                  {actionLabel}
                </Button>
              </Card>
            )}
          </aside>
        </div>

        <div className="mt-16 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted-ink)]">
          <span>Discover / Enter / Act</span>
          <span>{moment?.myResultId ? "Branch recorded" : "Make something of today"}</span>
        </div>
      </div>
    </section>
  );
}
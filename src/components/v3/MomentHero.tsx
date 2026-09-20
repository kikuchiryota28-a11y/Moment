"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";
import { MomentPhysicsScene } from "@/components/v3/MomentPhysicsScene";

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

function getStateLabel(state: MomentState) {
  if (state === "recorded") return "Your answer is in the world";
  if (state === "closed") return "This Moment has closed";
  if (state === "active") return "The Moment is live";
  return "Waiting for its first answer";
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
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const momentState = moment ? getMomentState(moment) : null;
  const actionLabel = momentState ? getActionLabel(momentState, busy) : state === "empty" ? "Come back tomorrow" : "Try again";
  const phase = moment && momentState ? getPhase(momentState) : "discover";

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
    <section className="relative isolate min-h-[100dvh] overflow-hidden bg-[#f3efe7] text-[#171614]">
      <MomentPhysicsScene
        moment={moment ? {
          id: moment.id,
          prompt: moment.prompt,
          participantCount: moment.participantCount,
          status: moment.status,
          myResultId: moment.myResultId,
        } : {
          id: "",
          prompt: "The next thing is still becoming.",
          participantCount: 0,
          status: "PREPARED",
          myResultId: null,
        }}
        phase={phase}
      />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
        <span className="text-[11px] font-black uppercase tracking-[0.26em]">MOMENT<span className="text-[#e86631]">.</span></span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">Daily / now</span>
      </header>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col px-5 pb-32 pt-28 sm:px-8 lg:grid lg:grid-cols-[minmax(150px,.6fr)_minmax(420px,1.8fr)_minmax(220px,.75fr)] lg:items-center lg:gap-10 lg:px-12 lg:pb-28 lg:pt-20">
        <aside className="hidden self-center lg:block">
          <div className="border-l border-black/15 pl-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">A daily invitation</p>
            <p className="mt-4 max-w-[10rem] text-sm leading-6 text-black/60">One prompt. Something real to notice. An action you take yourself.</p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col justify-center lg:flex-none">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#e86631]">
            <span className="h-px w-8 bg-[#e86631]" />
            {moment ? "Today's Moment" : state === "empty" ? "Between Moments" : "Connection interrupted"}
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mt-7 max-w-[10ch] text-[clamp(3.2rem,9vw,8.6rem)] font-medium leading-[0.86] tracking-[-0.075em] sm:max-w-[11ch] lg:mt-10">
              {moment?.prompt ?? (state === "empty" ? "The next thing is still becoming." : "Today's Moment is out of reach.")}
            </h1>
          </motion.div>

          <div className="mt-10 flex max-w-[35rem] items-start gap-4 border-t border-black/15 pt-5 sm:mt-14 sm:gap-8">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#e86631]" aria-hidden="true" />
            <p className="max-w-[28rem] text-sm leading-6 text-black/65 sm:text-base sm:leading-7">
              {moment
                ? "Take this prompt with you. The experience starts when you leave this screen."
                : state === "empty"
                ? "There is no Moment to enter right now. Your next invitation will appear here."
                : "We could not reach the Moment. Reload the space and try again."}
            </p>
          </div>
        </main>

        <aside className="mt-12 lg:mt-0 lg:self-center">
          {moment && momentState ? (
            <div className="border-t border-black/15 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">{getStateLabel(momentState)}</p>
              <p className="mt-3 text-sm leading-6 text-black/60">
                {moment.participantCount.toLocaleString()} {moment.participantCount === 1 ? "person" : "people"} are carrying this question today.
              </p>
              <button
                type="button"
                onClick={() => void activate()}
                disabled={busy}
                className="mt-8 flex min-h-14 w-full items-center justify-between gap-5 border border-[#171614] bg-[#171614] px-5 py-4 text-left text-sm font-bold text-[#f8f3ea] transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#e86631] hover:text-white active:translate-y-0 disabled:cursor-wait disabled:opacity-60 lg:max-w-[250px]"
              >
                <span>{actionLabel}</span>
                <span aria-hidden="true" className="text-lg font-normal">↗</span>
              </button>
              {actionError && <p role="alert" className="mt-3 text-xs font-bold leading-5 text-[#a13f2b]">{actionError}</p>}
            </div>
          ) : (
            <div className="border-t border-black/15 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">{state === "empty" ? "No action needed" : "Something went wrong"}</p>
              <button
                type="button"
                onClick={() => void activate()}
                disabled={state === "empty"}
                className="mt-8 flex min-h-14 w-full items-center justify-between gap-5 border border-[#171614] bg-transparent px-5 py-4 text-left text-sm font-bold transition-[background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#171614] hover:text-[#f8f3ea] disabled:cursor-not-allowed disabled:opacity-45 lg:max-w-[250px]"
              >
                <span>{actionLabel}</span>
                <span aria-hidden="true" className="text-lg font-normal">↗</span>
              </button>
            </div>
          )}
        </aside>
      </div>

      <div className="absolute bottom-28 left-5 font-mono text-[9px] uppercase tracking-[0.18em] text-black/35 sm:left-8 lg:bottom-10 lg:left-12">
        Discover / Enter / Act
      </div>
      <div className="absolute bottom-28 right-5 font-mono text-[9px] uppercase tracking-[0.18em] text-black/35 sm:right-8 lg:bottom-10 lg:right-12">
        {moment?.myResultId ? "Branch recorded" : "Make something of today"}
      </div>
    </section>
  );
}

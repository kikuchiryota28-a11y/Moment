"use client";

import { useOptimistic, useState, useTransition } from "react";
import { tryMoment } from "@/actions/journeys";
import type { JourneyStatus } from "@/types/moment";

export function TryButton({ momentId, initialStatus }: { momentId: string; initialStatus?: JourneyStatus | null }) {
  const [status, setStatus] = useState<JourneyStatus | null>(initialStatus ?? null);
  const [optimisticStatus, setOptimisticStatus] = useOptimistic<JourneyStatus | null, JourneyStatus | null>(status, (_, next) => next);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleTry() {
    if (isPending || optimisticStatus) return;
    setError("");
    startTransition(async () => {
      setOptimisticStatus("PLANNED");
      const result = await tryMoment(momentId);
      if (result.success) {
        setStatus(result.data.status);
        return;
      }
      setStatus(null);
      setOptimisticStatus(null);
      setError(result.error);
    });
  }

  const label = optimisticStatus === "PLANNED"
    ? "PLANNED ✓"
    : optimisticStatus === "TRYING"
      ? "TRYING…"
      : optimisticStatus === "COMPLETED"
        ? "COMPLETED ✓"
        : "TRY";

  return (
    <div>
      <button
        onClick={handleTry}
        disabled={isPending || Boolean(optimisticStatus)}
        aria-busy={isPending}
        className="w-full rounded-2xl bg-[#ef6b35] px-5 py-4 text-sm font-black tracking-[0.08em] text-white shadow-[0_8px_24px_rgba(239,107,53,.22)] transition hover:-translate-y-0.5 hover:bg-[#df5d29] active:translate-y-0 disabled:cursor-default disabled:opacity-80"
      >
        {label}
      </button>
      {error && <p role="alert" className="mt-2 text-center text-xs font-bold text-red-200">{error}</p>}
    </div>
  );
}

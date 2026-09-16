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
      setOptimisticStatus("TRYING");
      const result = await tryMoment(momentId);
      if (result.success) { setStatus(result.data.status); return; }
      setStatus(null); setOptimisticStatus(null); setError(result.error);
    });
  }

  const active = Boolean(optimisticStatus);
  const label = optimisticStatus === "COMPLETED" ? "COMPLETED" : "IN JOURNEY";
  return <div>
    <button onClick={handleTry} disabled={isPending || active} aria-busy={isPending} className={`w-full rounded-2xl px-5 py-4 text-sm font-black tracking-[0.08em] text-white shadow-[0_8px_24px_rgba(239,107,53,.22)] transition duration-200 ${active ? "bg-[#c95728]" : "bg-[#ef6b35] hover:-translate-y-0.5 hover:bg-[#df5d29] active:translate-y-0.5"}`}>
      {active ? `✓ ${label}` : "TRY"}
    </button>
    {error && <p role="alert" className="mt-2 text-center text-xs font-bold text-red-600">{error}</p>}
  </div>;
}

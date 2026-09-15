"use client";

import { useState } from "react";
import { tryMoment } from "@/actions/journeys";
import type { JourneyStatus } from "@/types/moment";

export function TryButton({ momentId, initialStatus }: { momentId: string; initialStatus?: JourneyStatus | null }) {
  const [status, setStatus] = useState<JourneyStatus | null>(initialStatus ?? null);
  const [loading, setLoading] = useState(false);
  async function handleTry() {
    if (loading || status) return;
    setLoading(true);
    const result = await tryMoment(momentId);
    setLoading(false);
    if (result.ok) setStatus(result.status);
    else window.alert(result.error);
  }
  const label = loading ? "Adding…" : status === "PLANNED" ? "PLANNED ✓" : status === "TRYING" ? "TRYING…" : status === "COMPLETED" ? "COMPLETED ✓" : "TRY";
  return <button onClick={handleTry} disabled={loading || Boolean(status)} className="w-full rounded-2xl bg-[#ef6b35] px-5 py-4 text-sm font-black tracking-[0.08em] text-white shadow-[0_8px_24px_rgba(239,107,53,.22)] transition hover:-translate-y-0.5 hover:bg-[#df5d29] active:translate-y-0 disabled:cursor-default disabled:opacity-80">{label}</button>;
}

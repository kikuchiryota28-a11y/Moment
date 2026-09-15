"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { startJourney, completeJourney } from "@/actions/journeys";
import type { Journey } from "@/types/moment";

export function JourneyCard({ journey }: { journey: Journey }) {
  const [status, setStatus] = useState(journey.status);
  const [busy, setBusy] = useState(false);
  async function advance() {
    setBusy(true);
    const result = status === "PLANNED" ? await startJourney(journey.id) : await completeJourney(journey.id);
    setBusy(false);
    if (result.ok) setStatus(result.status as typeof status); else window.alert(result.error);
  }
  return <article className="flex gap-4 rounded-3xl border border-[#ded8ce] bg-white/70 p-4">
    <div className="relative hidden aspect-square w-24 shrink-0 overflow-hidden rounded-2xl bg-[#e9e2d7] sm:block">{journey.mediaUrl && <Image src={journey.mediaUrl} alt="" fill sizes="96px" className="object-cover"/>}</div>
    <div className="min-w-0 flex-1"><Link href={`/moment/${journey.momentId}`} className="font-black hover:underline">{journey.moment?.title}</Link><p className="mt-2 text-xs font-black tracking-[0.08em] text-[#ef6b35]">{status}</p><p className="mt-1 text-xs text-[#777269]">{status === "COMPLETED" ? `Completed ${new Date(journey.completedAt ?? journey.updatedAt).toLocaleDateString()}` : `Added ${new Date(journey.plannedAt ?? journey.createdAt).toLocaleDateString()}`}</p>{status !== "COMPLETED" && <button disabled={busy} onClick={advance} className="mt-4 rounded-xl bg-[#171614] px-4 py-2 text-xs font-black text-white disabled:opacity-50">{busy ? "Updating…" : status === "PLANNED" ? "Start" : "Complete"}</button>}{status === "COMPLETED" && <Link href="/create" className="mt-4 inline-block text-xs font-black underline">Share your Moment</Link>}</div>
  </article>;
}

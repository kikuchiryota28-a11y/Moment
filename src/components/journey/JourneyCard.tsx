"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { startJourney, completeJourney } from "@/actions/journeys";
import type { Journey } from "@/types/moment";

export function JourneyCard({ journey }: { journey: Journey }) {
  const [status, setStatus] = useState(journey.status);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  function advance() {
    if (isPending) return;
    setError("");
    startTransition(async () => {
      const result = status === "PLANNED" ? await startJourney(journey.id) : await completeJourney(journey.id);
      if (result.success) setStatus(result.data.status); else setError(result.error);
    });
  }
  const title = journey.momentTitle ?? journey.moment?.title ?? "Deleted Moment";
  return <article className="flex gap-4 rounded-3xl border border-[#ded8ce] bg-white/70 p-4">
    <div className="relative hidden aspect-square w-24 shrink-0 overflow-hidden rounded-2xl bg-[#e9e2d7] sm:block">{journey.mediaUrl && <Image src={journey.mediaUrl} alt="" fill sizes="96px" className="object-cover"/>}</div>
    <div className="min-w-0 flex-1">
      {journey.momentId ? <Link href={`/moment/${journey.momentId}`} className="font-black hover:underline">{title}</Link> : <p className="font-black">{title}</p>}
      <p className="mt-2 text-xs font-black tracking-[0.08em] text-[#ef6b35]">{status}</p>
      <p className="mt-1 text-xs text-[#777269]">{status === "COMPLETED" ? `Completed ${new Date(journey.completedAt ?? journey.updatedAt).toLocaleDateString()}` : `Added ${new Date(journey.plannedAt ?? journey.createdAt).toLocaleDateString()}`}</p>
      {status !== "COMPLETED" && <button disabled={isPending} onClick={advance} className="mt-4 rounded-xl bg-[#171614] px-4 py-2 text-xs font-black text-white disabled:opacity-50">{isPending ? "Updating…" : status === "PLANNED" ? "Start" : "Complete"}</button>}
      {error && <p role="alert" className="mt-2 text-xs font-bold text-red-600">{error}</p>}
      {status === "COMPLETED" && journey.momentId && <Link href="/create" className="mt-4 inline-block text-xs font-black underline">Share your Moment</Link>}
    </div>
  </article>;
}

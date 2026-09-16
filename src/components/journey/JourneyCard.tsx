"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { completeJourney, recordExperience } from "@/actions/journeys";
import type { Journey } from "@/types/moment";

export function JourneyCard({ journey }: { journey: Journey }) {
  const [status, setStatus] = useState(journey.status === "PLANNED" ? "TRYING" : journey.status);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const title = journey.momentTitle ?? "Deleted Moment";

  function complete() {
    if (isPending || status !== "TRYING") return;
    setError("");
    startTransition(async () => {
      const result = await completeJourney(journey.id);
      if (result.success) setStatus("COMPLETED");
      else setError(result.error ?? "更新に失敗しました。");
    });
  }

  return <article className="rounded-[28px] border border-[#ded8ce] bg-white/70 p-4 sm:p-5">
    <div className="flex gap-4">
      <Link href={journey.momentId ? `/moment/${journey.momentId}` : "/"} className="relative hidden aspect-square w-24 shrink-0 overflow-hidden rounded-2xl bg-[#e9e2d7] sm:block">
        {journey.mediaUrl && <Image src={journey.mediaUrl} alt="" fill sizes="96px" className="object-cover"/>}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ef6b35]">{status === "TRYING" ? "TRYING" : "EXPERIENCED"}</p>
            <Link href={journey.momentId ? `/moment/${journey.momentId}` : "/"} className="mt-1 block font-black hover:underline">{title}</Link>
          </div>
          {journey.momentCategory && <span className="rounded-full bg-[#f3eee6] px-2.5 py-1 text-[11px] font-bold capitalize text-[#777269]">{journey.momentCategory}</span>}
        </div>

        {status === "TRYING" && <div className="mt-5 border-t border-[#eee8df] pt-4">
          <p className="text-sm font-bold">You decided to do this.</p>
          <p className="mt-1 text-xs leading-5 text-[#777269]">When it happens, mark it complete and leave a small trace of the experience.</p>
          <button onClick={complete} disabled={isPending} className="mt-4 rounded-xl bg-[#171614] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">{isPending ? "Finishing…" : "I DID IT"}</button>
        </div>}

        {status === "COMPLETED" && <ExperienceRecorder journey={journey} />}
        {error && <p role="alert" className="mt-3 text-xs font-bold text-red-600">{error}</p>}
      </div>
    </div>
  </article>;
}

function ExperienceRecorder({ journey }: { journey: Journey }) {
  const [note, setNote] = useState(journey.experienceNote ?? "");
  const [location, setLocation] = useState(journey.experienceLocationName ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(Boolean(journey.experienceRecordedAt));
  const [isPending, startTransition] = useTransition();

  function save() {
    if (!photo && !journey.experienceMediaUrl) { setError("経験を残す写真を1枚追加してください。"); return; }
    if (!note.trim()) { setError("短いメモを残してください。"); return; }
    setError("");
    const data = new FormData();
    data.set("journeyId", journey.id);
    data.set("note", note.trim());
    data.set("location", location.trim());
    if (photo) data.set("photo", photo);
    startTransition(async () => {
      const result = await recordExperience(data);
      if (result.success) setSaved(true);
      else setError(result.error);
    });
  }

  return <div className="mt-5 rounded-2xl border border-[#ded8ce] bg-[#fbf8f2] p-4">
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef6b35]">Your experience</p><p className="mt-1 text-sm font-bold">Leave a small trace.</p></div>{saved && <span className="text-xs font-black">Recorded ✓</span>}</div>
    {!saved && <div className="mt-3 space-y-3">
      <label className="block"><span className="text-xs font-bold">Photo</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-xs"/></label>
      <label className="block"><span className="text-xs font-bold">Short note</span><textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={3} placeholder="What do you want to remember?" className="mt-1 w-full resize-none rounded-xl border border-[#ded8ce] bg-white px-3 py-2 text-sm outline-none focus:border-[#ef6b35]"/></label>
      <label className="block"><span className="text-xs font-bold">Place <span className="font-normal text-[#777269]">(optional)</span></span><input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} placeholder="Tokyo, Adelaide…" className="mt-1 w-full rounded-xl border border-[#ded8ce] bg-white px-3 py-2 text-sm outline-none focus:border-[#ef6b35]"/></label>
      <button onClick={save} disabled={isPending} className="w-full rounded-xl bg-[#171614] px-4 py-3 text-xs font-black text-white disabled:opacity-50">{isPending ? "Recording…" : "Record Experience"}</button>
      {error && <p role="alert" className="text-xs font-bold text-red-600">{error}</p>}
    </div>}
  </div>;
}

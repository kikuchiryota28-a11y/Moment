"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { completeJourney, planJourney, recordExperience, startJourney } from "@/actions/journeys";
import type { Journey } from "@/types/moment";
import { isSuccess } from "@/lib/action-result";

export function JourneyCard({ journey }: { journey: Journey }) {
  const [status, setStatus] = useState<Journey["status"]>(journey.status);
  const [plannedAt, setPlannedAt] = useState(journey.plannedAt ? new Date(journey.plannedAt).toISOString().slice(0, 16) : "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const title = journey.momentTitle ?? "Deleted Moment";

  function run(action: () => Promise<{ success: boolean; error?: string }>, onSuccess: () => void) {
    if (isPending) return;
    setError("");
    startTransition(async () => {
      const result = await action();
      if (isSuccess(result)) onSuccess(); else setError(result.error ?? "更新に失敗しました。");
    });
  }

  function savePlan() {
    if (!plannedAt) { setError("予定日時を選択してください。"); return; }
    run(() => planJourney(journey.id, new Date(plannedAt).toISOString()), () => setPlannedAt(new Date(plannedAt).toISOString().slice(0, 16)));
  }

  function start() { run(() => startJourney(journey.id), () => setStatus("TRYING")); }
  function complete() { run(() => completeJourney(journey.id), () => setStatus("COMPLETED")); }

  return <article className="rounded-3xl border border-[#ded8ce] bg-white/70 p-4 sm:p-5">
    <div className="flex gap-4">
      <div className="relative hidden aspect-square w-24 shrink-0 overflow-hidden rounded-2xl bg-[#e9e2d7] sm:block">{journey.mediaUrl && <Image src={journey.mediaUrl} alt="" fill sizes="96px" className="object-cover"/>}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#ef6b35]">{status}</p><p className="mt-1 font-black">{title}</p></div>{journey.momentCategory && <span className="rounded-full bg-[#f3eee6] px-2.5 py-1 text-[11px] font-bold capitalize text-[#777269]">{journey.momentCategory}</span>}</div>
        {status === "PLANNED" && <div className="mt-4 rounded-2xl border border-[#eee8df] bg-white/60 p-3"><p className="text-xs font-bold">When will you do it?</p><div className="mt-2 flex flex-col gap-2 sm:flex_row"><input type="datetime-local" value={plannedAt} onChange={(e) => setPlannedAt(e.target.value ?? "")} className="min-h-10 flex-1 rounded-xl border border-[#ded8ce] bg-white px-3 text-xs outline-none focus:border-[#ef6b35]"/><button onClick={savePlan} disabled={isPending} className="rounded-xl bg-[#171614] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">{isPending ? "Saving…" : "Plan it"}</button></div></div>}
        <div className="mt-4 flex flex-wrap gap-2">
          {status === "PLANNED" && <button onClick={start} disabled={isPending} className="rounded-xl border border-[#171614] px-4 py-2 text-xs font-black disabled:opacity-50">{isPending ? "Starting…" : "Start"}</button>}
          {status === "TRYING" && <button onClick={complete} disabled={isPending} className="rounded-xl bg-[#171614] px-4 py-2 text-xs font-black text-white disabled:opacity-50">{isPending ? "Completing…" : "Complete"}</button>}
        </div>
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
    const data = new FormData(); data.set("journeyId", journey.id); data.set("note", note.trim()); data.set("location", location.trim()); if (photo) data.set("photo", photo);
    startTransition(async () => {
      const result = await recordExperience(data);
      if (isSuccess(result)) setSaved(true); else setError(result.error ?? "");
    });
  }

  return <div className="mt-5 rounded-2xl border border-[#ded8ce] bg-[#fbf8f2] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef6b35]">Record Experience</p><p className="mt-1 text-sm font-bold">How was it?</p></div>{journey.experienceRecordedAt && <span className="text-xs font-black">Saved ✓</span>}</div>
    <div className="mt-3 space-y-3"><label className="block"><span className="text-xs font-bold">Photo</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-xs"/></label><label className="block"><span className="text-xs font-bold">Short note</span><textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={3} placeholder="What do you want to remember?" className="mt-1 w-full resize-none rounded-xl border border-[#ded8ce] bg-white px-3 py-2 text-sm outline-none focus:border-[#ef6b35]"/></label><label className="block"><span className="text-xs font-bold">Place <span className="font-normal text-[#777269]">(optional)</span></span><input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} placeholder="Tokyo, Adelaide…" className="mt-1 w-full rounded-xl border border-[#ded8ce] bg-white px-3 py-2 text-sm outline-none focus:border-[#ef6b35]"/></label><button onClick={save} disabled={isPending || (journey.experienceRecordedAt !== null)} className="w-full rounded-xl bg-[#171614] px-4 py-3 text-xs font-black text-white disabled:opacity-50">{isPending ? "Saving…" : journey.experienceRecordedAt ? "Experience saved" : "Save Experience"}</button>{error && <p role="alert" className="text-xs font-bold text-red-600">{error}</p>}</div>
  </div>;
}
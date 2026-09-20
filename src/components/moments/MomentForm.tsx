"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMoment, updateMoment } from "@/actions/moments";
import { MediaUploader, type UploadedMedia } from "@/components/create/MediaUploader";
import { CATEGORIES } from "@/constants/categories";
import type { Moment, MomentMedia } from "@/types/moment";

export function MomentForm({ mode, moment, media: initialMedia = [] }: { mode: "create" | "edit"; moment?: Moment; media?: MomentMedia[] }) {
  const router = useRouter();
  const [media, setMedia] = useState<UploadedMedia[]>(initialMedia.map((item) => ({ url: item.mediaUrl, type: "image" })));
  const [rating, setRating] = useState(moment?.rating ?? 5);
  const [again, setAgain] = useState(moment?.wouldDoAgain ?? true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;
    setError("");
    const form = new FormData(e.currentTarget);
    const input = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      why: String(form.get("why") ?? ""),
      category: String(form.get("category") ?? ""),
      location: String(form.get("location") ?? ""),
      durationMinutes: Number(form.get("duration")) || undefined,
      estimatedCost: form.get("cost") ? Number(form.get("cost")) : undefined,
      experienceNote: String(form.get("experienceNote") ?? ""),
      rating,
      wouldDoAgain: again,
      media,
    };

    startTransition(async () => {
      const result = mode === "create"
        ? await createMoment(input)
        : await updateMoment({ ...input, momentId: moment!.id });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/moment/${result.data.id}`);
    });
  }

  return <form onSubmit={submit} className="space-y-6">
    <MediaUploader value={media} onChange={setMedia}/>
    <Field name="title" label="What did you do?" placeholder="Get off at a random station and explore" defaultValue={moment?.title}/>
    <TextArea name="description" label="How was it?" placeholder="Tell people what actually happened…" defaultValue={moment?.description}/>
    <TextArea name="why" label="Why did you do it?" placeholder="Optional context" defaultValue={moment?.why ?? ""}/>
    <div><label htmlFor="category" className="mb-2 block text-sm font-black">Category</label><select id="category" name="category" defaultValue={moment?.category ?? "explore"} className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3 outline-none focus:border-[#171614]"><option value="">Choose…</option>{CATEGORIES.filter((x) => x.value !== "all").map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></div>
    <Field name="location" label="Location" placeholder="Tokyo, Japan" defaultValue={moment?.locationName ?? ""}/>
    <div className="grid grid-cols-2 gap-3"><Field name="duration" label="Duration (min)" placeholder="30" type="number" defaultValue={moment?.durationMinutes?.toString()}/><Field name="cost" label="Estimated cost (¥)" placeholder="1000" type="number" defaultValue={moment?.estimatedCost?.toString()}/></div>
    <TextArea name="experienceNote" label="What was it actually like?" placeholder="What surprised you? What would you tell someone before they try it?" defaultValue={moment?.experienceNote ?? ""}/>
    <div><p className="mb-2 text-sm font-black">Your rating</p><div className="flex gap-2">{[1,2,3,4,5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} className={`min-h-11 min-w-11 text-3xl ${n <= rating ? "text-[#ef6b35]" : "text-[#cfc7bb]"}`} aria-label={`${n} stars`}>★</button>)}</div></div>
    <div><p className="mb-2 text-sm font-black">Would you do it again?</p><div className="grid grid-cols-2 gap-2">{[[true,"Yes"],[false,"No"]].map(([v,label]) => <button type="button" key={String(v)} onClick={() => setAgain(v as boolean)} className={`min-h-11 rounded-2xl border px-4 py-3 text-sm font-bold ${again === v ? "border-[#171614] bg-[#171614] text-white" : "border-[#ded8ce] bg-white"}`}>{label}</button>)}</div></div>
    {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    <button disabled={isPending} type="submit" aria-busy={isPending} className="min-h-12 w-full rounded-2xl bg-[#171614] px-5 py-4 font-black text-white disabled:opacity-50">{isPending ? (mode === "create" ? "Publishing…" : "Saving…") : mode === "create" ? "Publish Moment" : "Save Changes"}</button>
  </form>;
}

function Field({ name, label, placeholder, type = "text", defaultValue }: { name: string; label: string; placeholder?: string; type?: string; defaultValue?: string }) {
  return <div><label htmlFor={name} className="mb-2 block text-sm font-black">{label}</label><input id={name} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3 outline-none focus:border-[#171614]"/></div>;
}
function TextArea({ name, label, placeholder, defaultValue }: { name: string; label: string; placeholder?: string; defaultValue?: string }) {
  return <div><label htmlFor={name} className="mb-2 block text-sm font-black">{label}</label><textarea id={name} name={name} rows={5} defaultValue={defaultValue} placeholder={placeholder} className="w-full resize-none rounded-2xl border border-[#ded8ce] bg-white px-4 py-3 outline-none focus:border-[#171614]"/></div>;
}

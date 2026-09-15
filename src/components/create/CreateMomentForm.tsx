"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMoment } from "@/actions/moments";
import { MediaUploader, type UploadedMedia } from "./MediaUploader";
import { CATEGORIES } from "@/constants/categories";

export function CreateMomentForm() {
  const router = useRouter();
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [rating, setRating] = useState(5);
  const [again, setAgain] = useState(true);
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
      estimatedCost: Number(form.get("cost")) || undefined,
      rating,
      wouldDoAgain: again,
      media,
    };

    startTransition(async () => {
      const result = await createMoment(input);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/moment/${result.data.id}`);
    });
  }

  return <form onSubmit={submit} className="space-y-6">
    <MediaUploader value={media} onChange={setMedia}/>
    <Field name="title" label="What did you do?" placeholder="Get off at a random station and explore" />
    <TextArea name="description" label="How was it?" placeholder="Tell people what actually happened…" />
    <TextArea name="why" label="Why did you do it?" placeholder="Optional context" />
    <div><label className="mb-2 block text-sm font-black">Category</label><select name="category" defaultValue="explore" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3 outline-none"><option value="">Choose…</option>{CATEGORIES.filter((x) => x.value !== "all").map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></div>
    <Field name="location" label="Location" placeholder="Tokyo, Japan" /><div className="grid grid-cols-2 gap-3"><Field name="duration" label="Duration (min)" placeholder="30" type="number"/><Field name="cost" label="Estimated cost (¥)" placeholder="1000" type="number"/></div>
    <div><label className="mb-2 block text-sm font-black">Rating</label><div className="flex gap-2">{[1,2,3,4,5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} className={`min-h-11 min-w-11 text-3xl ${n <= rating ? "text-[#ef6b35]" : "text-[#cfc7bb]"}`} aria-label={`${n} stars`}>★</button>)}</div></div>
    <div><label className="mb-2 block text-sm font-black">Would you do it again?</label><div className="grid grid-cols-2 gap-2">{[[true,"Yes"],[false,"No"]].map(([v,label]) => <button type="button" key={String(v)} onClick={() => setAgain(v as boolean)} className={`min-h-11 rounded-2xl border px-4 py-3 text-sm font-bold ${again === v ? "border-[#171614] bg-[#171614] text-white" : "border-[#ded8ce] bg-white"}`}>{label}</button>)}</div></div>
    {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    <button disabled={isPending} type="submit" aria-busy={isPending} className="min-h-12 w-full rounded-2xl bg-[#171614] px-5 py-4 font-black text-white disabled:opacity-50">{isPending ? "Publishing…" : "Publish Moment"}</button>
  </form>;
}

function Field({ name, label, placeholder, type="text" }: { name: string; label: string; placeholder?: string; type?: string }) { return <div><label htmlFor={name} className="mb-2 block text-sm font-black">{label}</label><input id={name} name={name} type={type} placeholder={placeholder} className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3 outline-none focus:border-[#171614]"/></div>; }
function TextArea({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) { return <div><label htmlFor={name} className="mb-2 block text-sm font-black">{label}</label><textarea id={name} name={name} rows={5} placeholder={placeholder} className="w-full resize-none rounded-2xl border border-[#ded8ce] bg-white px-4 py-3 outline-none focus:border-[#171614]"/></div>; }

"use client";
import { useState } from "react";
import { submitTodayResult } from "@/actions/v3";
import { createClient } from "@/lib/supabase/client";
import type { ResultType } from "@/types/v3";

const TYPES: { value: ResultType; label: string }[] = [
  { value: "text", label: "WRITE" },
  { value: "choice", label: "CHOOSE" },
  { value: "photo", label: "PHOTO" },
  { value: "video", label: "VIDEO" },
  { value: "combination", label: "COMBINE" },
];

export function ResultComposer({ dailyMomentId }: { dailyMomentId: string }) {
  const [type, setType] = useState<ResultType>("text");
  const [text, setText] = useState("");
  const [choice, setChoice] = useState("");
  const [why, setWhy] = useState("");
  const [media, setMedia] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(file: File) {
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const max = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
    if ((!isImage && !isVideo) || file.size > max) {
      setMessage(isVideo ? "Use a video up to 50MB." : "Use an image up to 8MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setMessage("Please log in again."); setBusy(false); return; }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `${user.id}/v3/${crypto.randomUUID()}-${safeName}`;
    const { error } = await sb.storage.from("moment-media").upload(path, file, { contentType: file.type, upsert: false });
    if (error) { setMessage(error.message); setBusy(false); return; }
    setMedia(sb.storage.from("moment-media").getPublicUrl(path).data.publicUrl);
    setBusy(false);
  }

  async function submit() {
    setBusy(true);
    setMessage("");
    const fd = new FormData();
    fd.set("dailyMomentId", dailyMomentId);
    fd.set("resultType", type);
    fd.set("textContent", text);
    fd.set("choiceValue", choice);
    fd.set("why", why);
    fd.set("mediaUrl", media);
    const r = await submitTodayResult(fd);
    setMessage(r.success ? "YOUR MOMENT IS MADE." : (r.error ?? "Something went wrong."));
    setBusy(false);
  }

  const needsMedia = type === "photo" || type === "video" || type === "combination";
  const valid = type === "text" ? Boolean(text.trim()) : type === "choice" ? Boolean(choice) : Boolean(media) && (type !== "combination" || Boolean(text.trim()));

  return (
    <div className="rounded-[28px] border border-[#ded8ce] bg-white/70 p-5 sm:p-7">
      <p className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">Your answer</p>
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Answer format">
        {TYPES.map(({ value, label }) => (
          <button key={value} type="button" onClick={() => { setType(value); setMessage(""); }} aria-selected={type === value} className={`rounded-full border px-4 py-2 text-xs font-black ${type === value ? "border-[#171614] bg-[#171614] text-white" : "border-[#ded8ce] bg-white"}`}>
            {label}
          </button>
        ))}
      </div>

      {(type === "text" || type === "combination") && (
        <textarea value={text} onChange={e => setText(e.target.value)} maxLength={2000} placeholder="What did you find?" className="mt-4 min-h-32 w-full rounded-2xl border border-[#ded8ce] bg-white p-4 outline-none" />
      )}

      {type === "choice" && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {["Something ordinary", "Something surprising", "Something beautiful", "Something strange"].map(x => (
            <button key={x} type="button" onClick={() => setChoice(x)} aria-pressed={choice === x} className={`rounded-2xl border p-4 text-left text-sm font-bold ${choice === x ? "border-[#171614] bg-[#f1ece3]" : "border-[#ded8ce] bg-white"}`}>{x}</button>
          ))}
        </div>
      )}

      {needsMedia && (
        <div className="mt-4">
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#cfc7bb] p-8 text-center text-sm font-bold">
            {media ? "Media ready — choose another" : type === "video" ? "Bring back a short video" : "Bring back a photo"}
            <input type="file" accept={type === "video" ? "video/*" : "image/*"} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
          </label>
        </div>
      )}

      <input value={why} onChange={e => setWhy(e.target.value)} maxLength={500} placeholder="Optional: why this one?" className="mt-3 w-full rounded-2xl border border-[#ded8ce] bg-white p-4 outline-none" />
      <button type="button" onClick={() => void submit()} disabled={busy || !valid} className="mt-4 w-full rounded-2xl bg-[#171614] px-5 py-4 text-sm font-black text-white disabled:opacity-40">
        {busy ? "BRINGING IT BACK…" : "BRING IT BACK"}
      </button>
      {message && <p role="status" className="mt-3 text-sm font-bold">{message}</p>}
    </div>
  );
}

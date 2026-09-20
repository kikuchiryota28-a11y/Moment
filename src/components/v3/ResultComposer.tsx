"use client";
import { useState } from "react";
import { submitTodayResult } from "@/actions/v3";
import { createClient } from "@/lib/supabase/client";
import type { ResultType } from "@/types/v3";

const TYPES: { value: ResultType; label: string }[] = [
  { value: "text", label: "DESCRIBE" },
  { value: "choice", label: "CHOOSE" },
  { value: "photo", label: "CAPTURE" },
  { value: "video", label: "RECORD" },
  { value: "combination", label: "COMBINE" },
];

const glassInput = "border border-white/50 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,.7)] backdrop-blur-md placeholder:text-[#777269]/75 focus:border-[#171614]/30 focus:bg-white/55 focus:outline-none";

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
    setMessage(r.success ? "ACTION COMMITTED." : (r.error ?? "Something went wrong."));
    setBusy(false);
  }

  const needsMedia = type === "photo" || type === "video" || type === "combination";
  const valid = type === "text" ? Boolean(text.trim()) : type === "choice" ? Boolean(choice) : Boolean(media) && (type !== "combination" || Boolean(text.trim()));

  const placeholders: Record<ResultType, string> = {
    text: "What happened? What did you notice?",
    choice: "",
    photo: "",
    video: "",
    combination: "Add a note about this moment",
  };

  const mediaLabels: Record<ResultType, string> = {
    photo: "Capture a photo",
    video: "Record a short video",
    combination: "Add photo or video",
    text: "",
    choice: "",
  };

  return (
    <div className="rounded-[32px] border border-white/60 bg-white/40 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-7">
      <p className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">DECLARE YOUR ACTION</p>
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Action format">
        {TYPES.map(({ value, label }) => (
          <button key={value} type="button" onClick={() => { setType(value); setMessage(""); }} aria-selected={type === value} className={`rounded-full border px-4 py-2 text-xs font-black transition ${type === value ? "border-[#171614] bg-[#171614] text-white shadow-lg shadow-black/10" : "border-white/60 bg-white/35 text-[#171614] backdrop-blur-md hover:bg-white/60"}`}>
            {label}
          </button>
        ))}
      </div>

      {(type === "text" || type === "combination") && (
        <textarea value={text} onChange={e => setText(e.target.value)} maxLength={2000} placeholder={placeholders[type]} className={`mt-4 min-h-32 w-full rounded-2xl p-4 ${glassInput}`} />
      )}

      {type === "choice" && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {["Something ordinary", "Something surprising", "Something beautiful", "Something strange"].map(x => (
            <button key={x} type="button" onClick={() => setChoice(x)} aria-pressed={choice === x} className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${choice === x ? "border-[#171614]/30 bg-[#f1ece3]/75 shadow-inner" : "border-white/60 bg-white/35 backdrop-blur-md hover:bg-white/60"}`}>{x}</button>
          ))}
        </div>
      )}

      {needsMedia && (
        <div className="mt-4">
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-white/70 bg-white/25 p-8 text-center text-sm font-bold backdrop-blur-md transition hover:bg-white/45">
            {media ? "Media ready — choose another" : mediaLabels[type]}
            <input type="file" accept={type === "video" ? "video/*" : "image/*"} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
          </label>
        </div>
      )}

      <input value={why} onChange={e => setWhy(e.target.value)} maxLength={500} placeholder="Optional: why this action?" className={`mt-3 w-full rounded-2xl p-4 ${glassInput}`} />
      <button type="button" onClick={() => void submit()} disabled={busy || !valid} className="mt-4 w-full rounded-2xl bg-[#171614] px-5 py-4 text-sm font-black text-white shadow-[0_14px_35px_rgba(23,22,20,.18)] transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0">
        {busy ? "COMMITTING…" : "COMMIT ACTION"}
      </button>
      {message && <p role="status" className="mt-3 text-sm font-bold">{message}</p>}
    </div>
  );
}

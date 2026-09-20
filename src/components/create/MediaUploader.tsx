"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type UploadedMedia = { url: string; type: "image" };

export function MediaUploader({ value, onChange }: { value: UploadedMedia[]; onChange: (value: UploadedMedia[]) => void }) {
  const [uploading, setUploading] = useState(false);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); window.alert("Please log in again."); return; }
    const next = [...value];
    for (const file of Array.from(files).slice(0, 6 - value.length)) {
      if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) continue;
      const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
      const { error } = await supabase.storage.from("moment-media").upload(path, file, { contentType: file.type, upsert: false });
      if (error) { window.alert(error.message); continue; }
      const { data } = supabase.storage.from("moment-media").getPublicUrl(path);
      next.push({ url: data.publicUrl, type: "image" });
    }
    onChange(next); setUploading(false);
  }
  return <div>
    <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#cfc7bb] bg-white/50 p-6 text-center hover:bg-white/80"><Upload size={24}/><span className="mt-2 font-bold">{uploading ? "Uploading…" : "Upload media"}</span><span className="mt-1 text-xs text-[#777269]">Images up to 8MB · up to 6 files</span><input type="file" accept="image/*" multiple className="hidden" disabled={uploading || value.length >= 6} onChange={(e) => upload(e.target.files)}/></label>
    {value.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{value.map((item, i) => <div key={item.url} className="relative aspect-square overflow-hidden rounded-xl"><Image src={item.url} alt="" fill sizes="33vw" className="object-cover"/><button type="button" onClick={() => onChange(value.filter((_, index) => index !== i))} className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"><X size={14}/></button></div>)}</div>}
  </div>;
}

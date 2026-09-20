"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateProfile, uploadAvatar } from "@/actions/profiles";
import type { Profile } from "@/types/moment";
import { isSuccess } from "@/lib/action-result";

interface Props { profile: Profile & { websiteUrl: string | null; instagramUrl: string | null; xUrl: string | null } }

export function ProfileForm({ profile }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isSaving, startSaving] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [form, setForm] = useState({ displayName: profile.displayName, username: profile.username, bio: profile.bio ?? "", websiteUrl: profile.websiteUrl ?? "", instagramUrl: profile.instagramUrl ?? "", xUrl: profile.xUrl ?? "" });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false); setError("");
  }
  function save() {
    setError(""); setSaved(false);
    startSaving(async () => {
      const result = await updateProfile(form);
      if (isSuccess(result)) {
        setSaved(true); router.push(`/profile/${result.data.username}`);
        return;
      }
      setError(result.error);
    });
  }
  function chooseAvatar(file: File | undefined) {
    if (!file) return;
    setError("");
    const preview = URL.createObjectURL(file); setAvatarUrl(preview);
    startUploading(async () => {
      const data = new FormData(); data.set("avatar", file);
      const result = await uploadAvatar(data); URL.revokeObjectURL(preview);
      if (isSuccess(result)) {
        setAvatarUrl(result.data.avatarUrl);
        return;
      }
      setAvatarUrl(profile.avatarUrl); setError(result.error);
    });
  }

  return <div className="py-5 sm:py-10">
    <div className="flex items-center gap-3"><Link href={`/profile/${profile.username}`} aria-label="Back to profile" className="rounded-full p-2 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#ef6b35]"><ArrowLeft size={20}/></Link><h1 className="text-xl font-black">Edit Profile</h1></div>
    <section className="mt-8"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#777269]">Profile Photo</p><div className="mt-4 flex items-center gap-4">
      <div className="relative aspect-square w-20 h-20 min-w-20 min-h-20 max-w-20 max-h-20 shrink-0 overflow-hidden rounded-full bg-[#171614]">{avatarUrl ? <Image src={avatarUrl} alt="Profile photo" fill sizes="80px" className="w-full h-full min-w-full min-h-full shrink-0 aspect-square rounded-full object-cover" unoptimized={avatarUrl.startsWith("blob:")} /> : <div className="flex w-full h-full min-w-full min-h-full shrink-0 aspect-square items-center justify-center rounded-full text-2xl font-black text-white">{form.displayName.slice(0,1).toUpperCase()}</div>}</div>
      <div><button type="button" onClick={() => fileRef.current?.click()} disabled={isUploading} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ded8ce] bg-white/70 px-4 text-sm font-bold hover:bg-white disabled:opacity-60"><Camera size={16}/>{isUploading ? "Uploading…" : "Change photo"}</button><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => chooseAvatar(event.target.files?.[0])}/><p className="mt-2 text-xs text-[#777269]">JPEG, PNG, or WebP · 5MB max</p></div>
    </div></section>
    <section className="mt-10 space-y-5"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#777269]">Identity</p>
      <Field label="Display name" value={form.displayName} onChange={(value) => updateField("displayName", value)} maxLength={60}/>
      <Field label="Username" value={form.username} onChange={(value) => updateField("username", value)} maxLength={20} hint="3–20 letters, numbers, or underscores"/>
      <label className="block"><span className="text-sm font-bold">Bio</span><textarea value={form.bio} onChange={(e) => updateField("bio", e.target.value)} maxLength={500} rows={4} className="mt-2 w-full resize-none rounded-2xl border border-[#ded8ce] bg-white/70 px-4 py-3 text-sm outline-none transition focus:border-[#ef6b35] focus:ring-2 focus:ring-[#ef6b35]/15"/><span className="mt-1 block text-right text-xs text-[#777269]">{form.bio.length}/500</span></label>
    </section>
    <section className="mt-10 space-y-5"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#777269]">Links</p>
      <Field label="Website" value={form.websiteUrl} onChange={(value) => updateField("websiteUrl", value)} placeholder="https://example.com"/>
      <Field label="Instagram" value={form.instagramUrl} onChange={(value) => updateField("instagramUrl", value)} placeholder="https://instagram.com/…"/>
      <Field label="X" value={form.xUrl} onChange={(value) => updateField("xUrl", value)} placeholder="https://x.com/…"/>
    </section>
    {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {saved && <p role="status" className="mt-6 rounded-2xl border border-[#ded8ce] bg-white/70 px-4 py-3 text-sm font-semibold">Profile saved.</p>}
    <button type="button" onClick={save} disabled={isSaving || isUploading} className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#171614] px-5 text-sm font-black text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{isSaving && <Loader2 size={17} className="animate-spin"/>}{isSaving ? "Saving…" : "Save Changes"}</button>
  </div>;

  function Field({ label, value, onChange, placeholder, maxLength, hint }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; maxLength?: number; hint?: string }) {
    return <label className="block"><span className="text-sm font-bold">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} className="mt-2 min-h-11 w-full rounded-2xl border border-[#ded8ce] bg-white/70 px-4 text-sm outline-none transition focus:border-[#ef6b35] focus:ring-2 focus:ring-[#ef6b35]/15"/>{hint && <span className="mt-1 block text-xs text-[#777269]">{hint}</span>}</label>;
  }
}
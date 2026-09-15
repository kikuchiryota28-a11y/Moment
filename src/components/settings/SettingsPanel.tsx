"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/actions/auth";
import { deleteAccount, updateEmail, updatePassword, updateSettings } from "@/actions/settings";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { ThemePreference, Visibility } from "@/types/database";

interface SettingsState { theme: ThemePreference; notificationsEnabled: boolean; tryNotifications: boolean; reminderNotifications: boolean; activityVisibility: Visibility; experienceVisibility: Visibility }

export function SettingsPanel({ initial, email }: { initial: SettingsState; email: string }) {
  const router = useRouter(); const { theme, setTheme } = useTheme();
  const [state, setState] = useState(initial); const [emailValue, setEmailValue] = useState(email); const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [isPending, startTransition] = useTransition(); const [showDelete, setShowDelete] = useState(false);
  function save(next: SettingsState, rollback: SettingsState) { setError(""); setMessage(""); setState(next); startTransition(async () => { const result = await updateSettings(next); if (!result.success) { setState(rollback); if (next.theme !== rollback.theme) setTheme(rollback.theme); setError(result.error); return; } setMessage("Settings saved."); }); }
  function chooseTheme(next: ThemePreference) { const previous = state; setTheme(next); save({ ...state, theme: next }, previous); }
  function toggle(field: "notificationsEnabled" | "tryNotifications" | "reminderNotifications") { const previous = state; save({ ...state, [field]: !state[field] }, previous); }
  function setVisibility(field: "activityVisibility" | "experienceVisibility", value: Visibility) { const previous = state; save({ ...state, [field]: value }, previous); }
  function submitEmail() { setError(""); setMessage(""); startTransition(async () => { const result = await updateEmail(emailValue); if (!result.success) { setError(result.error); return; } setMessage("Check your email to confirm the address change."); }); }
  function submitPassword() { setError(""); setMessage(""); startTransition(async () => { const result = await updatePassword(password); if (!result.success) { setError(result.error); return; } setPassword(""); setMessage("Password updated."); }); }
  function removeAccount() { setError(""); startTransition(async () => { const result = await deleteAccount(); if (!result.success) { setError(result.error); return; } router.replace("/login"); }); }

  return <div className="py-5 sm:py-10">
    <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#777269]">Control</p><h1 className="mt-1 text-2xl font-black">Settings</h1></div><Link href="/profile/me" className="text-sm font-bold underline underline-offset-4">Profile</Link></div>
    {(error || message) && <div className="mt-6" role={error ? "alert" : "status"}>{error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : <p className="rounded-2xl border border-[#ded8ce] bg-white/70 px-4 py-3 text-sm font-semibold">{message}</p>}</div>}
    <Section title="ACCOUNT">
      <Row label="Email" description={email}><div className="flex gap-2"><input value={emailValue} onChange={(e) => setEmailValue(e.target.value)} type="email" autoComplete="email" className="min-h-10 min-w-0 flex-1 rounded-xl border border-[#ded8ce] bg-white/70 px-3 text-sm outline-none focus:border-[#ef6b35]"/><button onClick={submitEmail} disabled={isPending} className="rounded-xl bg-[#171614] px-3 text-xs font-bold text-white disabled:opacity-50">Save</button></div></Row>
      <Row label="Password" description="Update your MOMENT password"><div className="flex gap-2"><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" placeholder="8+ characters" className="min-h-10 min-w-0 flex-1 rounded-xl border border-[#ded8ce] bg-white/70 px-3 text-sm outline-none focus:border-[#ef6b35]"/><button onClick={submitPassword} disabled={isPending} className="rounded-xl bg-[#171614] px-3 text-xs font-bold text-white disabled:opacity-50">Update</button></div></Row>
      <Row label="Log out" description="End this session"><form action={signOut}><button className="min-h-10 rounded-xl border border-[#ded8ce] px-4 text-sm font-bold">Log out</button></form></Row>
      <Row label="Delete account" description="Permanently remove your MOMENT account"><button onClick={() => setShowDelete(true)} className="min-h-10 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700">Delete</button></Row>
    </Section>
    <Section title="PREFERENCES">
      <Row label="Appearance" description="System, light, or dark"><div className="grid grid-cols-3 gap-2">{(["system","light","dark"] as const).map((value) => <button key={value} onClick={() => chooseTheme(value)} aria-pressed={theme === value} className={`min-h-10 rounded-xl border px-3 text-xs font-bold capitalize ${theme === value ? "border-[#171614] bg-[#171614] text-white" : "border-[#ded8ce] bg-white/60"}`}>{value}</button>)}</div></Row>
      <ToggleRow label="Notifications" checked={state.notificationsEnabled} onChange={() => toggle("notificationsEnabled")} />
      <ToggleRow label="TRY activity" checked={state.tryNotifications} disabled={!state.notificationsEnabled} onChange={() => toggle("tryNotifications")} />
      <ToggleRow label="Reminders" checked={state.reminderNotifications} disabled={!state.notificationsEnabled} onChange={() => toggle("reminderNotifications")} />
    </Section>
    <Section title="PRIVACY & DATA">
      <VisibilityRow label="Activity visibility" value={state.activityVisibility} onChange={(value) => setVisibility("activityVisibility", value)} description="Controls whether your published Moments appear publicly." />
      <VisibilityRow label="Experience visibility" value={state.experienceVisibility} onChange={(value) => setVisibility("experienceVisibility", value)} description="Controls whether completed Journey activity is publicly readable." />
    </Section>
    <Section title="ABOUT"><Row label="About MOMENT" description="Discover something worth doing."/><Row label="Terms" description="Legal information"/><Row label="Privacy" description="Privacy information"/><Row label="Contact" description="Get in touch"/></Section>
    {showDelete && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center"><div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-3xl bg-[#f6f2ea] p-6 shadow-2xl"><h2 id="delete-title" className="text-xl font-black">Delete your account?</h2><p className="mt-3 text-sm leading-6 text-[#5f5a52]">This permanently removes your profile, Moments, Journeys, likes, comments, and follows. This cannot be undone.</p><div className="mt-6 grid grid-cols-2 gap-3"><button onClick={() => setShowDelete(false)} disabled={isPending} className="min-h-12 rounded-full border border-[#ded8ce] font-bold">Cancel</button><button onClick={removeAccount} disabled={isPending} className="min-h-12 rounded-full bg-red-700 font-bold text-white disabled:opacity-50">{isPending ? "Deleting…" : "Delete account"}</button></div></div></div>}
  </div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-10"><h2 className="mb-3 text-xs font-black tracking-[0.16em] text-[#777269]">{title}</h2><div className="divide-y divide-[#ded8ce] overflow-hidden rounded-3xl border border-[#ded8ce] bg-white/55">{children}</div></section>; }
function Row({ label, description, children }: { label: string; description?: string; children?: React.ReactNode }) { return <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-sm font-bold">{label}</p>{description && <p className="mt-1 text-xs leading-5 text-[#777269]">{description}</p>}</div>{children}</div>; }
function ToggleRow({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: () => void }) { return <Row label={label}><button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={onChange} className={`relative h-7 w-12 rounded-full transition disabled:opacity-40 ${checked ? "bg-[#171614]" : "bg-[#c8c1b6]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`}/></button></Row>; }
function VisibilityRow({ label, description, value, onChange }: { label: string; description: string; value: Visibility; onChange: (value: Visibility) => void }) { return <Row label={label} description={description}><div className="grid grid-cols-2 gap-2">{(["public","private"] as const).map((item) => <button key={item} onClick={() => onChange(item)} aria-pressed={value === item} className={`min-h-10 rounded-xl border px-3 text-xs font-bold capitalize ${value === item ? "border-[#171614] bg-[#171614] text-white" : "border-[#ded8ce] bg-white/60"}`}>{item}</button>)}</div></Row>; }

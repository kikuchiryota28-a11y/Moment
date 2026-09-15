"use client";

import { useActionState } from "react";

type ActionResult = { ok?: boolean; error?: string };
type Action = (formData: FormData) => Promise<ActionResult>;

export function AuthForm({ action, mode }: { action: Action; mode: "login" | "signup" }) {
  const [state, formAction, pending] = useActionState(async (_prev: ActionResult, formData: FormData) => action(formData), {});
  return <form action={formAction} className="space-y-4">
    {mode === "signup" && <><input name="displayName" required placeholder="Display name" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/><input name="username" required placeholder="Username (3–24 chars)" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/></>}
    <input name="email" type="email" required placeholder="Email" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/>
    <input name="password" type="password" minLength={8} required placeholder="Password (8+ characters)" className="w-full rounded-2xl border border-[#ded8ce] bg-white px-4 py-3"/>
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p>}
    <button disabled={pending} className="w-full rounded-2xl bg-[#171614] px-5 py-4 font-black text-white disabled:opacity-50">{pending ? "Working…" : mode === "signup" ? "Create account" : "Log in"}</button>
  </form>;
}

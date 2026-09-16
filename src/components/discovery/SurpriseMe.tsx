import { surpriseMe } from "@/actions/moments";

export function SurpriseMe() {
  return <form action={surpriseMe} className="mt-6">
    <button type="submit" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#171614] px-6 text-sm font-black tracking-[0.04em] text-white shadow-[0_14px_32px_rgba(23,22,20,.16)] transition hover:-translate-y-0.5 hover:bg-[#2b2926] focus:outline-none focus:ring-2 focus:ring-[#ef6b35] focus:ring-offset-2">
      SURPRISE ME
      <span aria-hidden="true" className="text-white/60 transition-transform group-hover:translate-x-0.5">↗</span>
    </button>
    <p className="mt-3 text-xs text-[#777269]">Something you haven’t tried yet.</p>
  </form>;
}

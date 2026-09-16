"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getSurpriseMoment } from "@/actions/moments";

export function SurpriseMeButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function surprise() {
    if (isPending) return;
    setError("");
    startTransition(async () => {
      const result = await getSurpriseMoment();
      if (result.success) router.push(`/moment/${result.data.id}?surprise=1`);
      else setError(result.error);
    });
  }

  return <div>
    <button type="button" onClick={surprise} disabled={isPending} aria-busy={isPending} className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#171614] px-7 text-sm font-black tracking-[0.08em] text-white shadow-[0_14px_35px_rgba(23,22,20,.16)] transition hover:-translate-y-0.5 hover:bg-[#2b2926] disabled:cursor-wait disabled:opacity-70">
      <Sparkles size={18} className="transition-transform duration-300 group-hover:rotate-12" />
      {isPending ? "FINDING A MOMENT…" : "SURPRISE ME"}
    </button>
    {error && <p role="alert" className="mt-2 text-xs font-bold text-red-600">{error}</p>}
  </div>;
}

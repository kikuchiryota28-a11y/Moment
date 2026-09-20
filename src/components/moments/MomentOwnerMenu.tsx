"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteMoment } from "@/actions/moments";
import { isSuccess } from "@/lib/action-result";

export function MomentOwnerMenu({ momentId }: { momentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function remove() {
    if (isPending) return;
    if (!window.confirm("Delete this Moment? This removes the public Moment and its social activity. Your existing Journey history is preserved.")) return;
    setError("");
    startTransition(async () => {
      const result = await deleteMoment(momentId);
      if (isSuccess(result)) {
        router.replace("/");
        return;
      }
      setError(result.error ?? "");
    });
  }

  return <div className="relative">
    <button type="button" aria-label="Moment actions" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#ded8ce] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#ef6b35]"><MoreHorizontal size={20}/></button>
    {open && <div className="absolute right-0 top-12 z-20 w-44 rounded-2xl border border-[#ded8ce] bg-white p-1.5 shadow-xl">
      <Link href={`/moment/${momentId}/edit`} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-black/5"><Pencil size={16}/> Edit Moment</Link>
      <button type="button" disabled={isPending} onClick={remove} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={16}/>{isPending ? "Deleting…" : "Delete Moment"}</button>
      {error && <p role="alert" className="px-3 py-2 text-xs font-bold text-red-600">{error}</p>}
    </div>}
  </div>;
}
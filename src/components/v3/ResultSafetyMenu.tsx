"use client";
import { useState } from "react";
import { reportResult, blockUser } from "@/actions/v3-safety";

export function ResultSafetyMenu({ resultId, userId }: { resultId: string; userId: string | null }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  async function report() {
    const reason = window.prompt("What is wrong with this answer?", "Unsafe or inappropriate content");
    if (!reason) return;
    const r = await reportResult(resultId, reason);
    setMessage(r.success ? "Thanks. We'll review it." : (r.error ?? "Could not report."));
    setOpen(false);
  }
  async function block() {
    if (!userId) return;
    const r = await blockUser(userId);
    setMessage(r.success ? "This person is now blocked." : (r.error ?? "Could not block."));
    setOpen(false);
  }
  return <div className="relative text-right"><button type="button" aria-label="More options" onClick={() => setOpen(v => !v)} className="rounded-full px-2 py-1 text-lg font-black text-[#777269]">•••</button>{open && <div className="absolute right-0 z-20 mt-1 w-48 rounded-2xl border border-[#ded8ce] bg-white p-2 text-left shadow-xl"><button type="button" onClick={() => void report()} className="block w-full rounded-xl px-3 py-2 text-sm font-bold hover:bg-[#f1ece3]">Report answer</button>{userId && <button type="button" onClick={() => void block()} className="block w-full rounded-xl px-3 py-2 text-sm font-bold hover:bg-[#f1ece3]">Block person</button>}</div>}{message && <p role="status" className="mt-2 text-xs text-[#777269]">{message}</p>}</div>;
}

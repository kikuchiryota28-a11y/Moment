"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function PassButton({ momentId }: { momentId: string }) {
  const [message, setMessage] = useState("");

  async function pass() {
    const url = `${window.location.origin}/moment/${momentId}`;
    const shareData = { title: "A Moment for you", text: "I experienced this. Thought you might want to try it too.", url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(url); setMessage("Link copied"); }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Could not share this Moment.");
    }
  }

  return <div className="flex items-center gap-3"><button type="button" onClick={pass} className="inline-flex items-center gap-2 rounded-full border border-[#ded8ce] bg-white px-4 py-2.5 text-xs font-black transition hover:-translate-y-0.5 hover:border-[#171614]"><Send size={14}/> PASS THIS MOMENT</button>{message && <span role="status" className="text-xs font-bold text-[#777269]">{message}</span>}</div>;
}

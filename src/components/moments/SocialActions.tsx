"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { toggleLike, addComment } from "@/actions/social";

export function SocialActions({ momentId, liked, likeCount }: { momentId: string; liked: boolean; likeCount: number }) {
  const [isLiked, setIsLiked] = useState(liked);
  const [count, setCount] = useState(likeCount);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  async function like() { if (busy) return; setBusy(true); const r = await toggleLike(momentId); setBusy(false); if (r.ok) { setIsLiked(r.liked); setCount((n) => n + (r.liked ? 1 : -1)); } }
  async function submitComment() { const r = await addComment(momentId, comment); if (r.ok) setComment(""); else window.alert(r.error); }
  return <div className="space-y-5">
    <div className="flex items-center gap-5 border-y border-[#ded8ce] py-4">
      <button onClick={like} disabled={busy} className="flex items-center gap-2 text-sm font-bold"><Heart size={19} fill={isLiked ? "currentColor" : "none"}/>{count}</button>
      <span className="flex items-center gap-2 text-sm font-bold"><MessageCircle size={19}/> Comments</span>
      <button onClick={() => navigator.share?.({ title: document.title, url: window.location.href })} className="ml-auto flex items-center gap-2 text-sm font-bold"><Share2 size={18}/> Share</button>
    </div>
    <div className="flex gap-2"><input value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Add a thought…" className="min-w-0 flex-1 rounded-xl border border-[#ded8ce] bg-white px-4 py-3 text-sm outline-none focus:border-[#171614]"/><button onClick={submitComment} disabled={!comment.trim()} className="rounded-xl bg-[#171614] px-4 text-sm font-bold text-white disabled:opacity-40">Post</button></div>
  </div>;
}

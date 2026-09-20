"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { setMomentLike, addComment } from "@/actions/social";
import { isSuccess } from "@/lib/action-result";

export function SocialActions({ momentId, liked, likeCount }: { momentId: string; liked: boolean; likeCount: number }) {
  const [baseLike, setBaseLike] = useState({ liked, count: likeCount });
  const [optimisticLike, setOptimisticLike] = useOptimistic(baseLike, (_, next: { liked: boolean; count: number }) => next);
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [commentPending, setCommentPending] = useState(false);

  function handleLike() {
    if (isPending) return;
    const nextLiked = !optimisticLike.liked;
    const next = { liked: nextLiked, count: Math.max(0, optimisticLike.count + (nextLiked ? 1 : -1)) };
    setError("");

    startTransition(async () => {
      setOptimisticLike(next);
      const result = await setMomentLike(momentId, nextLiked);
      if (isSuccess(result)) {
        setBaseLike(next);
        return;
      }
      setOptimisticLike(baseLike);
      setError(result.error ?? "");
    });
  }

  function submitComment() {
    if (commentPending) return;
    const body = comment.trim();
    if (!body) return;
    setCommentPending(true);
    setError("");
    void addComment(momentId, body).then((result) => {
      setCommentPending(false);
      if (isSuccess(result)) {
        setComment("");
        return;
      }
      setError(result.error ?? "");
    });
  }

  return <div className="space-y-5">
    <div className="flex items-center gap-5 border-y border-[#ded8ce] py-4">
      <button
        onClick={handleLike}
        disabled={isPending}
        aria-label={optimisticLike.liked ? "Unlike Moment" : "Like Moment"}
        aria-pressed={optimisticLike.liked}
        aria-busy={isPending}
        className="flex min-h-11 items-center gap-2 text-sm font-bold disabled:cursor-default disabled:opacity-70"
      >
        <Heart size={19} fill={optimisticLike.liked ? "currentColor" : "none"}/>{optimisticLike.count}
      </button>
      <span className="flex items-center gap-2 text-sm font-bold"><MessageCircle size={19}/> Comments</span>
      <button onClick={() => navigator.share?.({ title: document.title, url: window.location.href })} aria-label="Share Moment" className="ml-auto flex min-h-11 items-center gap-2 text-sm font-bold"><Share2 size={18}/> Share</button>
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{error}</p>}
    <div className="flex gap-2">
      <input value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Add a thought…" aria-label="Comment" className="min-w-0 flex-1 rounded-xl border border-[#ded8ce] bg-white px-4 py-3 text-sm outline-none focus:border-[#171614]"/>
      <button onClick={submitComment} disabled={!comment.trim() || commentPending} className="rounded-xl bg-[#171614] px-4 text-sm font-bold text-white disabled:opacity-40">{commentPending ? "Posting…" : "Post"}</button>
    </div>
  </div>;
}
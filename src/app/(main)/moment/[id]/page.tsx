import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, MapPin, Star } from "lucide-react";
import { getMomentDetail } from "@/lib/db/moments";
import { TryButton } from "@/components/moments/TryButton";
import { SocialActions } from "@/components/moments/SocialActions";

export default async function MomentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMomentDetail(id);
  if (!data) notFound();
  const { moment, author, media, social, journey, comments } = data;
  return <article className="py-5 sm:py-8">
    <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17}/> Discover</Link>
    <div className="overflow-hidden rounded-[30px] bg-[#e9e2d7]">{media.length ? <div className="relative aspect-[4/3]">{media.slice(0,1).map((item) => <Image key={item.id} src={item.mediaUrl} alt="" fill priority sizes="100vw" className="object-cover"/>)}</div> : <div className="flex aspect-[4/3] items-center justify-center text-[#777269]">No media</div>}</div>
    <div className="space-y-7 py-7">
      <div><p className="text-sm font-bold text-[#777269]">{author.displayName} · @{author.username}</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{moment.title}</h1><p className="mt-4 text-base leading-8 text-[#5f5a52]">{moment.description}</p></div>
      <div className="flex flex-wrap gap-3">{[moment.category, moment.locationName, moment.durationMinutes ? `${moment.durationMinutes} min` : null, moment.estimatedCost ? `¥${moment.estimatedCost.toLocaleString()}` : null].filter(Boolean).map((x) => <span key={String(x)} className="rounded-full border border-[#ded8ce] bg-white/70 px-3 py-2 text-xs font-bold">{x}</span>)}</div>
      <div className="rounded-3xl border border-[#ded8ce] bg-white/60 p-5"><div className="flex items-center gap-2"><Star size={19} fill="currentColor"/><span className="text-lg font-black">{moment.rating}/5</span></div><p className="mt-2 text-sm text-[#777269]">{moment.wouldDoAgain ? "The creator would do it again." : "The creator sees this as a one-time experience."}</p></div>
      <section className="rounded-[28px] bg-[#171614] p-5 text-white sm:p-7"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Your next move</p><h2 className="mt-2 text-2xl font-black">Make this a real experience.</h2><p className="mt-2 mb-5 text-sm leading-6 text-white/65">TRY adds it to your Journey. It does not clutter your feed. It gives you something to actually do.</p><TryButton momentId={moment.id} initialStatus={journey.status}/></section>
      <SocialActions momentId={moment.id} liked={social.isLiked} likeCount={social.likeCount}/>
      <section><h2 className="mb-4 text-xl font-black">Comments <span className="text-[#777269]">{social.commentCount}</span></h2><div className="space-y-4">{comments.map((comment) => <div key={comment.id} className="rounded-2xl bg-white/60 p-4"><p className="text-xs font-bold">{comment.author?.displayName ?? "Someone"}</p><p className="mt-1 text-sm leading-6">{comment.body}</p></div>)}</div></section>
    </div>
  </article>;
}

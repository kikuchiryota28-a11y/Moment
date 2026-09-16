import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, MapPin, WalletCards } from "lucide-react";
import { getMomentDetail } from "@/lib/db/moments";
import { TryButton } from "@/components/moments/TryButton";
import { PassButton } from "@/components/moments/PassButton";
import { SocialActions } from "@/components/moments/SocialActions";
import { MomentOwnerMenu } from "@/components/moments/MomentOwnerMenu";

export default async function MomentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMomentDetail(id);
  if (!data) notFound();
  const { moment, author, media, social, journey, comments, isOwner, experienceCount } = data;
  return <article className="py-5 sm:py-8">
    <div className="mb-5 flex items-center justify-between gap-3"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17}/> Discover</Link>{isOwner && <MomentOwnerMenu momentId={moment.id}/>}</div>
    <div className="overflow-hidden rounded-[30px] bg-[#e9e2d7]">{media.length ? <div className="relative aspect-[4/3]">{media.slice(0,1).map((item) => <Image key={item.id} src={item.mediaUrl} alt="" fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover"/> )}</div> : <div className="flex aspect-[4/3] items-center justify-center text-[#777269]">No media</div>}</div>
    <div className="space-y-8 py-7">
      <header><p className="text-sm font-bold text-[#777269]">{author.displayName} · @{author.username}</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{moment.title}</h1><p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5a52]">{moment.description}</p></header>
      {experienceCount > 0 && <p className="text-sm font-bold text-[#777269]">{experienceCount} {experienceCount === 1 ? "person has" : "people have"} experienced this.</p>}
      <div className="grid gap-3 sm:grid-cols-3">{moment.locationName && <div className="rounded-2xl border border-[#ded8ce] bg-white/60 p-4"><MapPin size={16}/><p className="mt-2 text-xs font-bold text-[#777269]">WHERE</p><p className="mt-1 font-black line-clamp-2">{moment.locationName}</p></div>}{moment.durationMinutes !== null && <div className="rounded-2xl border border-[#ded8ce] bg-white/60 p-4"><Clock3 size={16}/><p className="mt-2 text-xs font-bold text-[#777269]">TIME</p><p className="mt-1 font-black">{moment.durationMinutes >= 60 ? `${Math.round(moment.durationMinutes / 60 * 10) / 10} hours` : `${moment.durationMinutes} min`}</p></div>}{moment.estimatedCost !== null && <div className="rounded-2xl border border-[#ded8ce] bg-white/60 p-4"><WalletCards size={16}/><p className="mt-2 text-xs font-bold text-[#777269]">COST</p><p className="mt-1 font-black">{moment.estimatedCost === 0 ? "Free" : `¥${moment.estimatedCost.toLocaleString()}`}</p></div>}</div>
      {moment.why && <section><p className="text-xs font-black uppercase tracking-[0.18em] text-[#ef6b35]">Why this is interesting</p><p className="mt-2 max-w-2xl text-base leading-7">{moment.why}</p></section>}
      {moment.experienceNote && <section className="rounded-3xl border border-[#ded8ce] bg-white/60 p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#ef6b35]">From the creator</p><p className="mt-3 text-base leading-7">{moment.experienceNote}</p></section>}
      <section className="rounded-[28px] bg-[#171614] p-5 text-white sm:p-7"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Your next move</p><h2 className="mt-2 text-2xl font-black">Make this a real experience.</h2><p className="mt-2 mb-5 text-sm leading-6 text-white/65">TRY puts this Moment into your Journey and starts the experience.</p><TryButton momentId={moment.id} initialStatus={journey.status}/></section>
      {journey.status === "COMPLETED" && <div className="flex flex-wrap items-center gap-3"><PassButton momentId={moment.id}/><span className="text-xs text-[#777269]">Share something you actually did.</span></div>}
      <SocialActions momentId={moment.id} liked={social.isLiked} likeCount={social.likeCount}/>
      <section><h2 className="mb-4 text-xl font-black">Comments <span className="text-[#777269]">{social.commentCount}</span></h2><div className="space-y-4">{comments.map((comment) => <div key={comment.id} className="rounded-2xl bg-white/60 p-4"><p className="text-xs font-bold">{comment.author?.displayName ?? "Someone"}</p><p className="mt-1 text-sm leading-6">{comment.body}</p></div>)}</div></section>
    </div>
  </article>;
}

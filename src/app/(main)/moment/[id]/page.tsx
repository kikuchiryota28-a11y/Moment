import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, MapPin, Star } from "lucide-react";
import { getMomentDetail } from "@/lib/db/moments";
import { TryButton } from "@/components/moments/TryButton";
import { SocialActions } from "@/components/moments/SocialActions";
import { MomentOwnerMenu } from "@/components/moments/MomentOwnerMenu";

export default async function MomentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMomentDetail(id);
  if (!data) notFound();
  const { moment, author, media, social, journey, comments, isOwner } = data;
  const completeness = [
    ["Story", Boolean(moment.description)], ["Cover", media.length > 0], ["Category", Boolean(moment.category)],
    ["Location", Boolean(moment.locationName)], ["Cost", moment.estimatedCost !== null], ["Time", moment.durationMinutes !== null],
    ["Why", Boolean(moment.why)], ["Experience", Boolean(moment.experienceNote)],
  ];
  return <article className="py-5 sm:py-8">
    <div className="mb-5 flex items-center justify-between gap-3"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17}/> Discover</Link>{isOwner && <MomentOwnerMenu momentId={moment.id}/>}</div>
    <div className="overflow-hidden rounded-[30px] bg-[#e9e2d7]">{media.length ? <div className="relative aspect-[4/3]">{media.slice(0,1).map((item) => <Image key={item.id} src={item.mediaUrl} alt="" fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover"/> )}</div> : <div className="flex aspect-[4/3] items-center justify-center text-[#777269]">No media</div>}</div>
    <div className="space-y-7 py-7">
      <div><p className="text-sm font-bold text-[#777269]">{author.displayName} · @{author.username}</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{moment.title}</h1><p className="mt-4 text-base leading-8 text-[#5f5a52]">{moment.description}</p></div>
      <div className="flex flex-wrap gap-3">{[moment.category, moment.locationName, moment.durationMinutes ? `${moment.durationMinutes} min` : null, moment.estimatedCost !== null ? `¥${moment.estimatedCost.toLocaleString()}` : null].filter(Boolean).map((x) => <span key={String(x)} className="rounded-full border border-[#ded8ce] bg-white/70 px-3 py-2 text-xs font-bold">{x}</span>)}</div>
      <div className="grid grid-cols-3 gap-3 text-sm">{moment.durationMinutes !== null && <div className="rounded-2xl border border-[#ded8ce] bg-white/60 p-4"><Clock3 size={16}/><p className="mt-2 font-black">{moment.durationMinutes} min</p></div>}{moment.locationName && <div className="rounded-2xl border border-[#ded8ce] bg-white/60 p-4"><MapPin size={16}/><p className="mt-2 font-black line-clamp-2">{moment.locationName}</p></div>}<div className="rounded-2xl border border-[#ded8ce] bg-white/60 p-4"><Star size={16} fill="currentColor"/><p className="mt-2 font-black">{moment.rating}/5</p></div></div>
      {moment.why && <section><p className="text-xs font-black uppercase tracking-[0.18em] text-[#ef6b35]">Why try this?</p><p className="mt-2 text-base leading-7">{moment.why}</p></section>}
      {moment.experienceNote && <section className="rounded-3xl border border-[#ded8ce] bg-white/60 p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#ef6b35]">What it was like</p><p className="mt-3 text-base leading-7">{moment.experienceNote}</p><p className="mt-3 text-sm font-bold text-[#777269]">{moment.wouldDoAgain ? "The creator would do it again." : "The creator sees this as a one-time experience."}</p></section>}
      {isOwner && <section className="rounded-3xl border border-[#ded8ce] bg-white/50 p-5"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#777269]">Moment details</p><div className="mt-4 grid grid-cols-2 gap-2">{completeness.map(([label, done]) => <div key={label} className="flex items-center gap-2 text-sm font-bold">{done ? <span aria-hidden="true">✓</span> : <span aria-hidden="true">○</span>}<span>{label}</span></div>)}</div><p className="mt-4 text-xs leading-5 text-[#777269]">Complete more details to make this experience easier for someone else to act on.</p></section>}
      <section className="rounded-[28px] bg-[#171614] p-5 text-white sm:p-7"><p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Your next move</p><h2 className="mt-2 text-2xl font-black">Make this a real experience.</h2><p className="mt-2 mb-5 text-sm leading-6 text-white/65">TRY adds it to your Journey. It gives you something to actually do.</p><TryButton momentId={moment.id} initialStatus={journey.status}/></section>
      <SocialActions momentId={moment.id} liked={social.isLiked} likeCount={social.likeCount}/>
      <section><h2 className="mb-4 text-xl font-black">Comments <span className="text-[#777269]">{social.commentCount}</span></h2><div className="space-y-4">{comments.map((comment) => <div key={comment.id} className="rounded-2xl bg-white/60 p-4"><p className="text-xs font-bold">{comment.author?.displayName ?? "Someone"}</p><p className="mt-1 text-sm leading-6">{comment.body}</p></div>)}</div></section>
    </div>
  </article>;
}

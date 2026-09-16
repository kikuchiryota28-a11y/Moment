import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock3, WalletCards } from "lucide-react";
import type { Moment, Profile } from "@/types/moment";
import { TryButton } from "./TryButton";
import { Avatar } from "@/components/shared/Avatar";

export function MomentCard({ moment, author, mediaUrl }: { moment: Moment; author: Profile; mediaUrl: string | null }) {
  return <article className="overflow-hidden rounded-[28px] border border-[#ded8ce] bg-white/80 shadow-[0_12px_40px_rgba(30,25,15,.06)]">
    <Link href={`/moment/${moment.id}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e2d7]">{mediaUrl ? <Image src={mediaUrl} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover transition duration-500 hover:scale-[1.02]" /> : <div className="flex h-full items-center justify-center text-sm text-[#777269]">Moment media</div>}<span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold capitalize">{moment.category}</span></div>
    </Link>
    <div className="space-y-4 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs text-[#777269]"><Avatar src={author.avatarUrl} name={author.displayName} size={28}/><span className="font-bold text-[#171614]">{author.displayName}</span><span>·</span><span>@{author.username}</span></div>
      <div><Link href={`/moment/${moment.id}`} className="text-xl font-black tracking-[-0.025em] hover:underline">{moment.title}</Link><p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5f5a52]">{moment.description}</p></div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#777269]">{moment.locationName && <span className="flex items-center gap-1"><MapPin size={14}/>{moment.locationName}</span>}{moment.durationMinutes && <span className="flex items-center gap-1"><Clock3 size={14}/>{moment.durationMinutes >= 60 ? `${Math.round(moment.durationMinutes / 60 * 10) / 10}h` : `${moment.durationMinutes} min`}</span>}{moment.estimatedCost !== null && <span className="flex items-center gap-1"><WalletCards size={14}/>{moment.estimatedCost === 0 ? "Free" : `¥${moment.estimatedCost.toLocaleString()}`}</span>}</div>
      {moment.why && <p className="border-l-2 border-[#ef6b35] pl-3 text-sm italic leading-6 text-[#5f5a52]">{moment.why}</p>}
      <div className="flex items-center justify-between gap-4 border-t border-[#eee8df] pt-4"><span className="text-xs font-bold text-[#777269]">{moment.wouldDoAgain ? "Worth doing again" : "A one-time experience"}</span><div className="w-32"><TryButton momentId={moment.id}/></div></div>
    </div>
  </article>;
}

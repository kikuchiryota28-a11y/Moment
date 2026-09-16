import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { CategoryScroller } from "@/components/moments/CategoryScroller";
import { MomentCard } from "@/components/moments/MomentCard";
import { SurpriseMeButton } from "@/components/moments/SurpriseMeButton";
import { getMoments } from "@/lib/db/moments";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const moments = await getMoments(category);
  return <div>
    <AppHeader />
    <section className="pb-8 pt-6 sm:pb-12 sm:pt-10">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef6b35]">What’s next?</p>
      <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="max-w-2xl text-4xl font-black tracking-[-0.055em] sm:text-6xl">Something worth doing.</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#777269]">Discover a Moment, decide if it’s yours, then make it real.</p></div>
        <div className="shrink-0"><SurpriseMeButton /></div>
      </div>
    </section>
    <CategoryScroller />
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#777269]">Discover</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">Moments worth trying</h2></div><span className="text-xs font-bold text-[#777269]">{moments.length} available</span></div>
      {moments.length ? <div className="space-y-6">{moments.map((item) => <MomentCard key={item.moment.id} {...item} />)}</div> : <div className="rounded-3xl border border-dashed border-[#cfc7bb] p-10 text-center"><p className="font-bold">Nothing here yet.</p><p className="mt-1 text-sm text-[#777269]">Try another category or create the first Moment.</p><Link href="/create" className="mt-5 inline-block rounded-xl bg-[#171614] px-4 py-3 text-xs font-black text-white">Create a Moment</Link></div>}
    </section>
  </div>;
}

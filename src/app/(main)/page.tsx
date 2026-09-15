import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { CategoryScroller } from "@/components/moments/CategoryScroller";
import { MomentCard } from "@/components/moments/MomentCard";
import { getMoments } from "@/lib/db/moments";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const moments = await getMoments(category);
  return <div><AppHeader />
    <section className="pb-7 pt-5 sm:pt-10">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#ef6b35]">Discovery</p>
      <h1 className="max-w-xl text-4xl font-black tracking-[-0.055em] sm:text-6xl">What do you want to do?</h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-[#777269]">Real experiences from real people. Find one that makes you want to leave the house.</p>
    </section>
    <CategoryScroller />
    <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#777269]">For you</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em]">Moments worth trying</h2></div></div>
      {moments.length ? <div className="space-y-6">{moments.map((item) => <MomentCard key={item.moment.id} {...item} />)}</div> : <div className="rounded-3xl border border-dashed border-[#cfc7bb] p-10 text-center"><p className="font-bold">No Moments found.</p><p className="mt-1 text-sm text-[#777269]">Try another category.</p><Link href="/" className="mt-5 inline-block font-bold underline">See all</Link></div>}
    </section>
  </div>;
}

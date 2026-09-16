import Link from "next/link";
import { getMyJourneys } from "@/lib/db/journeys";
import { JourneyCard } from "@/components/journey/JourneyCard";

export default async function JourneyPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const journeys = await getMyJourneys(status);
  const active = journeys.find((j) => j.status === "TRYING");
  const tabs = ["ALL", "TRYING", "COMPLETED"];
  return <div className="py-5 sm:py-10">
    <div className="mb-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef6b35]">Your next experience</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">Journey</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#777269]">Not a to-do list. Just the things you decided to make real, and the experiences that came from them.</p></div>
    {!status || status === "ALL" ? <section className="mb-7 rounded-[28px] bg-[#171614] p-5 text-white sm:p-7">{active ? <><p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/50">TRYING NOW</p><h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">{active.momentTitle ?? "Your Moment"}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-white/65">You already chose it. The next step is outside the app.</p></> : <><p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/50">NEXT</p><h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">Find something worth doing.</h2><Link href="/" className="mt-5 inline-flex rounded-xl bg-white px-4 py-3 text-xs font-black text-[#171614]">Discover Moments</Link></>}</section> : null}
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1">{tabs.map((tab) => <Link key={tab} href={tab === "ALL" ? "/journey" : `/journey?status=${tab}`} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black ${((status ?? "ALL") === tab) ? "border-[#171614] bg-[#171614] text-white" : "border-[#ded8ce] bg-white"}`}>{tab[0] + tab.slice(1).toLowerCase()}</Link>)}</div>
    {journeys.length ? <div className="space-y-3">{journeys.map((j) => <JourneyCard key={j.id} journey={j}/>)}</div> : <div className="rounded-3xl border border-dashed border-[#cfc7bb] p-10 text-center"><p className="font-bold">Nothing here yet.</p><p className="mt-1 text-sm text-[#777269]">The next experience is somewhere in Discover.</p><Link href="/" className="mt-5 inline-block rounded-xl bg-[#171614] px-4 py-3 text-xs font-black text-white">Discover Moments</Link></div>}
  </div>;
}

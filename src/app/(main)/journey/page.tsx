import Link from "next/link";
import { getMyJourneys } from "@/lib/db/journeys";
import { JourneyCard } from "@/components/journey/JourneyCard";

export default async function JourneyPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const journeys = await getMyJourneys(status);
  const tabs = ["ALL", "PLANNED", "TRYING", "COMPLETED"];
  return <div className="py-5 sm:py-10"><div className="mb-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef6b35]">Your experience log</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">Journey</h1><p className="mt-3 text-sm text-[#777269]">Things you decided to actually do.</p></div><div className="mb-6 flex gap-2 overflow-x-auto pb-1">{tabs.map((tab) => <Link key={tab} href={tab === "ALL" ? "/journey" : `/journey?status=${tab}`} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black ${((status ?? "ALL") === tab) ? "border-[#171614] bg-[#171614] text-white" : "border-[#ded8ce] bg-white"}`}>{tab[0] + tab.slice(1).toLowerCase()}</Link>)}</div>{journeys.length ? <div className="space-y-3">{journeys.map((j) => <JourneyCard key={j.id} journey={j}/>)}</div> : <div className="rounded-3xl border border-dashed border-[#cfc7bb] p-10 text-center"><p className="font-bold">Nothing here yet.</p><p className="mt-1 text-sm text-[#777269]">Find something you want to experience.</p><Link href="/" className="mt-5 inline-block rounded-xl bg-[#171614] px-4 py-3 text-xs font-black text-white">Discover Moments</Link></div>}</div>;
}

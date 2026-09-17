import Link from "next/link";
import { notFound } from "next/navigation";
import { getTodayMoment, getResults } from "@/lib/db/v3";
import { StartMomentButton } from "@/components/v3/StartMomentButton";
import { ResultComposer } from "@/components/v3/ResultComposer";

function AmbientSpace() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F5F0E8]">
      <div className="absolute -left-[18vw] -top-[18vw] h-[55vw] w-[55vw] max-h-[760px] max-w-[760px] rounded-full bg-gradient-to-br from-orange-300/35 via-pink-200/25 to-transparent blur-[120px] animate-pulse" />
      <div className="absolute -bottom-[20vw] -right-[18vw] h-[52vw] w-[52vw] max-h-[720px] max-w-[720px] rounded-full bg-gradient-to-br from-blue-300/25 via-purple-200/25 to-transparent blur-[120px] animate-pulse [animation-delay:1200ms]" />
    </div>
  );
}

export default async function MomentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let moment;
  try { moment = await getTodayMoment(); } catch { return notFound(); }
  if (moment.id !== id) return notFound();
  const results = await getResults(id);
  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status);

  return (
    <main className="relative isolate min-h-[calc(100vh-1px)] overflow-hidden py-6 sm:py-10">
      <AmbientSpace />

      <div aria-hidden="true" className="pointer-events-none absolute -left-[9vw] top-[5vh] z-0 select-none whitespace-nowrap text-[14vw] font-black leading-none tracking-tighter text-[#d9d0c4]/70 opacity-20 -rotate-6">
        MOMENT
      </div>

      <Link href="/" className="relative z-20 text-sm font-bold">← MOMENT</Link>

      <section className="relative z-10 mt-10 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#ef6b35]">Today&apos;s Moment</p>
        <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-.05em] sm:text-6xl">{moment.prompt}</h1>
        <p className="mt-5 text-sm text-[#777269]">{moment.participantCount.toLocaleString()} people are in this Moment.</p>

        {!live && <div className="mt-8"><StartMomentButton id={id} /></div>}
        {live && !moment.myResultId && <div className="mt-8"><ResultComposer dailyMomentId={id} /></div>}
        {moment.myResultId && (
          <div className="mt-8 rounded-[32px] border border-white/60 bg-white/40 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[.18em]">YOU MADE A MOMENT.</p>
            <Link href={`/moment/${id}/reveal`} className="mt-4 inline-block rounded-2xl bg-[#171614] px-5 py-4 text-sm font-black text-white">SEE WHAT THE WORLD FOUND</Link>
          </div>
        )}
        {results.length > 0 && <Link href={`/moment/${id}/reveal`} className="mt-5 block text-center text-sm font-black underline">WORLD REVEAL →</Link>}
      </section>
    </main>
  );
}

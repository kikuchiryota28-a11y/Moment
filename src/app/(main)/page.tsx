import Link from "next/link";
import { getTodayMoment } from "@/lib/db/v3";
import { StartMomentButton } from "@/components/v3/StartMomentButton";

function AmbientSpace() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F5F0E8]">
      <div className="absolute -left-[18vw] -top-[18vw] h-[55vw] w-[55vw] max-h-[760px] max-w-[760px] rounded-full bg-gradient-to-br from-orange-300/35 via-pink-200/25 to-transparent blur-[120px] animate-pulse" />
      <div className="absolute -bottom-[20vw] -right-[18vw] h-[52vw] w-[52vw] max-h-[720px] max-w-[720px] rounded-full bg-gradient-to-br from-blue-300/25 via-purple-200/25 to-transparent blur-[120px] animate-pulse [animation-delay:1200ms]" />
    </div>
  );
}

export default async function Home() {
  const moment = await getTodayMoment();
  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status);

  return (
    <main className="relative isolate min-h-[calc(100vh-1px)] overflow-hidden py-10 sm:py-16">
      <AmbientSpace />

      <div aria-hidden="true" className="pointer-events-none absolute -left-[9vw] top-[8vh] z-0 select-none whitespace-nowrap text-[14vw] font-black leading-none tracking-tighter text-[#d9d0c4]/70 opacity-20 -rotate-6">
        MOMENT
      </div>

      <div className="relative z-10 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#ef6b35]">MOMENT</p>
        <p className="mt-8 text-sm font-bold text-[#777269]">RIGHT NOW, SOMEWHERE IN THE WORLD...</p>
        <h1 className="mt-3 text-5xl font-black leading-[.95] tracking-[-.06em] sm:text-7xl">SAME QUESTION.<br />DIFFERENT REALITY.</h1>

        <section className="mt-12 rounded-[32px] border border-white/60 bg-white/40 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">TODAY&apos;S MOMENT</p>
          <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-.04em] sm:text-5xl">{moment.prompt}</h2>
          <p className="mt-5 text-sm text-[#777269]">{moment.participantCount.toLocaleString()} people are in this Moment.</p>
          {moment.myResultId ? (
            <Link href={`/moment/${moment.id}`} className="mt-7 block w-full rounded-2xl bg-[#171614] px-5 py-4 text-center text-sm font-black text-white">CONTINUE</Link>
          ) : live ? (
            <Link href={`/moment/${moment.id}`} className="mt-7 block w-full rounded-2xl bg-[#171614] px-5 py-4 text-center text-sm font-black text-white">MAKE YOUR MOMENT</Link>
          ) : (
            <div className="mt-7"><StartMomentButton id={moment.id} /></div>
          )}
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import { getTodayMoment } from "@/lib/db/v3";
import { StartMomentButton } from "@/components/v3/StartMomentButton";

export default async function Home() {
  const moment = await getTodayMoment();
  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status);

  return (
    <main className="py-10 sm:py-16">
      <div className="relative max-w-3xl">
        <div aria-hidden="true" className="pointer-events-none absolute -left-8 -top-20 select-none text-[clamp(8rem,34vw,21rem)] font-black leading-none tracking-[-.12em] text-[#171614]/10">
          MOMENT
        </div>
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#ef6b35]">MOMENT</p>
          <p className="mt-8 text-sm font-bold text-[#777269]">RIGHT NOW, SOMEWHERE IN THE WORLD...</p>
          <h1 className="mt-3 text-5xl font-black leading-[.95] tracking-[-.06em] sm:text-7xl">SAME QUESTION.<br />DIFFERENT REALITY.</h1>

          <section className="mt-12 rounded-[32px] border border-white/60 bg-white/60 p-6 shadow-[0_28px_90px_rgba(83,65,45,.13),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-xl sm:p-10">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#ef6b35]">TODAY&apos;S MOMENT</p>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-.04em] sm:text-5xl">{moment.prompt}</h2>
            <p className="mt-5 text-sm text-[#777269]">{moment.participantCount.toLocaleString()} people are in this Moment.</p>
            {moment.myResultId ? <Link href={`/moment/${moment.id}`} className="mt-7 block w-full rounded-2xl bg-[#171614] px-5 py-4 text-center text-sm font-black text-white">CONTINUE</Link> : live ? <Link href={`/moment/${moment.id}`} className="mt-7 block w-full rounded-2xl bg-[#171614] px-5 py-4 text-center text-sm font-black text-white">MAKE YOUR MOMENT</Link> : <div className="mt-7"><StartMomentButton id={moment.id} /></div>}
          </section>
        </div>
      </div>
    </main>
  );
}

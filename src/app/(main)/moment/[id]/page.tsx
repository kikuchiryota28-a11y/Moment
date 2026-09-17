import Link from "next/link";
import { notFound } from "next/navigation";
import { getTodayMoment, getResults } from "@/lib/db/v3";
import { StartMomentButton } from "@/components/v3/StartMomentButton";
import { ResultComposer } from "@/components/v3/ResultComposer";

export default async function MomentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let moment;
  try { moment = await getTodayMoment(); } catch { return notFound(); }
  if (moment.id !== id) return notFound();
  const results = await getResults(id);
  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status);

  return (
    <main className="py-6 sm:py-10">
      <Link href="/" className="relative z-20 text-sm font-bold">← MOMENT</Link>

      <section className="relative mt-10 max-w-3xl">
        <div aria-hidden="true" className="pointer-events-none absolute -left-8 -top-14 select-none text-[clamp(7rem,30vw,18rem)] font-black leading-none tracking-[-.1em] text-[#171614]/10">
          MOMENT
        </div>
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#ef6b35]">Today&apos;s Moment</p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-.05em] sm:text-6xl">{moment.prompt}</h1>
          <p className="mt-5 text-sm text-[#777269]">{moment.participantCount.toLocaleString()} people are in this Moment.</p>

          {!live && <div className="mt-8"><StartMomentButton id={id} /></div>}
          {live && !moment.myResultId && <div className="mt-8"><ResultComposer dailyMomentId={id} /></div>}
          {moment.myResultId && (
            <div className="mt-8 rounded-[28px] border border-white/55 bg-white/55 p-6 shadow-[0_20px_60px_rgba(83,65,45,.10)] backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[.18em]">YOU MADE A MOMENT.</p>
              <Link href={`/moment/${id}/reveal`} className="mt-4 inline-block rounded-2xl bg-[#171614] px-5 py-4 text-sm font-black text-white">SEE WHAT THE WORLD FOUND</Link>
            </div>
          )}
          {results.length > 0 && <Link href={`/moment/${id}/reveal`} className="mt-5 block text-center text-sm font-black underline">WORLD REVEAL →</Link>}
        </div>
      </section>
    </main>
  );
}

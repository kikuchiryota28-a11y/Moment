import Link from "next/link";
import { notFound } from "next/navigation";
import { getTodayMoment, getResults } from "@/lib/db/v3";
import { StartMomentButton } from "@/components/v3/StartMomentButton";
import { ResultComposer } from "@/components/v3/ResultComposer";
import { MomentDetailMotion } from "@/components/v3/MomentDetailMotion";

export default async function MomentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let moment;
  try { moment = await getTodayMoment(); } catch { return notFound(); }
  if (moment.id !== id) return notFound();
  const results = await getResults(id);
  const live = ["FIRST_MOVER", "LIVE", "ENDING"].includes(moment.status);

  return (
    <MomentDetailMotion prompt={moment.prompt} participantCount={moment.participantCount} live={live}>
      {!live && <div className="mb-5"><StartMomentButton id={id} /></div>}
      {live && !moment.myResultId && <ResultComposer dailyMomentId={id} />}
      {moment.myResultId && (
        <section className="mt-5 overflow-hidden rounded-[30px] border border-[var(--line)] bg-[var(--ink)] p-7 text-[var(--bg)] sm:p-9">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--bg)]/55">YOU MADE A MOMENT.</p>
          <p className="mt-4 max-w-xl text-2xl font-black tracking-[-0.04em] sm:text-3xl">Now see what the world found.</p>
          <Link href={`/moment/${id}/reveal`} className="mt-7 inline-flex rounded-full bg-[var(--bg)] px-6 py-4 text-xs font-black tracking-[0.08em] text-[var(--ink)] transition-transform active:scale-[0.98]">SEE THE WORLD →</Link>
        </section>
      )}
      {results.length > 0 && !moment.myResultId && (
        <Link href={`/moment/${id}/reveal`} className="mt-7 block text-center text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted)] transition-opacity hover:opacity-60">WORLD REVEAL →</Link>
      )}
    </MomentDetailMotion>
  );
}

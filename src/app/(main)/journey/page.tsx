import Link from "next/link";
import { getMyV3Results } from "@/lib/db/v3-journey";
import { MotionCard } from "@/components/v3/MotionSystem";
import { JourneyMotion } from "@/components/v3/JourneyMotion";

export default async function JourneyPage() {
  const results = await getMyV3Results();
  return (
    <JourneyMotion count={results.length}>
      {results.length ? (
        <div className="space-y-3">
          {results.map((r: any, index: number) => (
            <MotionCard key={r.id} className="overflow-hidden rounded-[26px] border border-[var(--line)] bg-white/55 dark:bg-white/[0.04]" interactive>
              <Link href={`/moment/${r.daily_moment_id}/reveal`} className="block p-5 sm:p-6">
                <div className="flex items-start justify-between gap-5">
                  <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)]">{r.daily_moments?.moment_date}</p><p className="mt-3 text-xl font-black leading-tight tracking-[-0.03em] sm:text-2xl">{r.daily_moments?.prompt}</p></div>
                  <span className="shrink-0 text-[10px] font-black text-[var(--muted)]">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p>
              </Link>
            </MotionCard>
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-[var(--line)] p-10 text-center"><p className="text-xl font-black tracking-[-0.03em]">Your first Moment is waiting.</p><p className="mt-2 text-sm text-[var(--muted)]">There is nothing to collect until you go outside and make one.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-6 py-4 text-xs font-black tracking-[0.08em] text-[var(--bg)]">GO TO MOMENT</Link></div>
      )}
    </JourneyMotion>
  );
}

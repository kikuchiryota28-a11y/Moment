import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getMyV3Results, getMyV3Journeys } from "@/lib/db/v3-journey";
import { PhaseBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function JourneyPage() {
  const [results, journeys] = await Promise.all([getMyV3Results(), getMyV3Journeys()]);
  const journeyMap = new Map(journeys.map((j) => [j.daily_moment_id, j]));
  const merged = results.map((r: any) => ({ ...r, phase: journeyMap.get(r.daily_moment_id)?.phase ?? "completed" }));
  const journeyOnly = journeys.filter((j) => !results.some((r: any) => r.daily_moment_id === j.daily_moment_id));

  return (
    <main className="moment-container py-8 pb-28 md:py-12 md:pb-16">
      <header className="pb-8">
        <p className="moment-eyebrow text-[var(--color-accent)]">Journey</p>
        <h1 className="moment-display mt-3 max-w-2xl text-5xl md:text-7xl">What did you do?</h1>
      </header>
      <section className="border-y border-[var(--color-line)]">
        {merged.length || journeyOnly.length ? (
          <div className="divide-y divide-[var(--color-line)]">
            {merged.map((r: any) => (
              <Link key={r.id} href={r.phase === "trying" ? `/moment/${r.daily_moment_id}` : `/moment/${r.daily_moment_id}/reveal`} className="group flex min-h-24 items-center justify-between gap-5 py-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><PhaseBadge phase={r.phase as "planned"|"trying"|"completed"} size="sm" /><span className="text-xs text-[var(--color-muted-ink)]">{r.daily_moments?.moment_date}</span></div>
                  <p className="mt-2 truncate text-lg font-semibold tracking-[-0.02em] group-hover:text-[var(--color-accent)]">{r.daily_moments?.prompt}</p>
                  <p className="mt-1 truncate text-sm text-[var(--color-muted-ink)]">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p>
                </div>
                <ArrowUpRight size={18} className="shrink-0 text-[var(--color-muted-ink)]" aria-hidden="true" />
              </Link>
            ))}
            {journeyOnly.map((j: any) => (
              <Link key={j.id} href={`/moment/${j.daily_moment_id}`} className="flex min-h-20 items-center justify-between gap-5 py-5">
                <div><PhaseBadge phase={j.phase as "planned"|"trying"|"completed"} size="sm" /><p className="mt-2 text-lg font-semibold">{j.daily_moments?.prompt}</p></div>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <h2 className="moment-display text-4xl">Nothing yet.</h2>
            <Link href="/" className="mt-6 inline-flex"><Button size="lg">Open Moment</Button></Link>
          </div>
        )}
      </section>
    </main>
  );
}
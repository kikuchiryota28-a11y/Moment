import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getMyV3Results, getMyV3Journeys } from "@/lib/db/v3-journey";
import { PhaseBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";

export default async function JourneyPage() {
  const [results, journeys] = await Promise.all([getMyV3Results(), getMyV3Journeys()]);
  const journeyMap = new Map(journeys.map((j) => [j.daily_moment_id, j]));
  const merged = results.map((r: any) => ({ ...r, phase: journeyMap.get(r.daily_moment_id)?.phase ?? "completed" }));
  const journeyOnly = journeys.filter((j) => !results.some((r: any) => r.daily_moment_id === j.daily_moment_id));

  return (
    <main className="moment-container py-8 pb-28 md:py-12 md:pb-16">
      <header className="border-b border-[var(--color-line-value)] pb-7">
        <p className="moment-eyebrow text-[var(--color-primary-value)]">Journey</p>
        <h1 className="moment-display mt-3 max-w-3xl text-5xl md:text-7xl">What did you do?</h1>
      </header>

      <section className="py-8">
        {merged.length || journeyOnly.length ? (
          <div className="space-y-2">
            {merged.map((r: any) => (
              <Link key={r.id} href={r.phase === "trying" ? `/moment/${r.daily_moment_id}` : `/moment/${r.daily_moment_id}/reveal`} className="group block">
                <Card variant="interactive" padding="md" className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><PhaseBadge phase={r.phase as "planned"|"trying"|"completed"} size="sm" /><span className="text-xs text-[var(--color-muted-ink-value)]">{r.daily_moments?.moment_date}</span></div>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.025em]">{r.daily_moments?.prompt}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted-ink-value)]">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--color-surface-container-value)]"><ArrowUpRight size={18} /></span>
                </Card>
              </Link>
            ))}
            {journeyOnly.map((j: any) => (
              <Link key={j.id} href={`/moment/${j.daily_moment_id}`} className="group block">
                <Card variant="outlined" className="flex items-start justify-between gap-5">
                  <div><PhaseBadge phase={j.phase as "planned"|"trying"|"completed"} size="sm" /><p className="mt-2 text-xl font-semibold">{j.daily_moments?.prompt}</p></div>
                  <ArrowUpRight size={18} />
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card variant="outlined" className="p-10 text-center">
            <h2 className="moment-display text-4xl">Nothing yet.</h2>
            <Link href="/" className="mt-6 inline-flex"><Button size="lg">Open Moment</Button></Link>
          </Card>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import { getMyV3Results, getMyV3Journeys } from "@/lib/db/v3-journey";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Badge, PhaseBadge } from "@/components/ui/Badge";

const phaseLabels = {
  planned: "PLANNED — Discovered, not yet entered",
  trying: "TRYING — In the Moment, acting now",
  completed: "COMPLETED — Action committed, branch formed",
};

export default async function JourneyPage() {
  const [results, journeys] = await Promise.all([getMyV3Results(), getMyV3Journeys()]);

  const journeyMap = new Map(journeys.map((j) => [j.daily_moment_id, j]));

  const merged = results.map((r: any) => {
    const journey = journeyMap.get(r.daily_moment_id);
    return {
      ...r,
      phase: journey?.phase ?? "completed",
      experience_note: journey?.experience_note,
      experience_media_url: journey?.experience_media_url,
      experience_location_name: journey?.experience_location_name,
    };
  });

  const journeyOnly = journeys.filter(
    (j) => !journeyMap.has(j.daily_moment_id) || !results.some((r: any) => r.daily_moment_id === j.daily_moment_id)
  );

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-16">
      <header className="max-w-3xl mb-12">
        <Badge variant="accent" className="mb-4">JOURNEY</Badge>
        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.9] tracking-[-0.04em] font-[var(--font-display)] text-[var(--color-ink)]">
          Your action loop.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-muted-ink)]">
          Each Moment you enter becomes a branch in your journey. PLANNED → TRYING → COMPLETED.
        </p>
      </header>

      <div className="space-y-4 mb-16">
        {merged.length > 0 || journeyOnly.length > 0 ? (
          <>
            {merged.map((r: any) => {
              const href = r.phase === "trying" ? `/moment/${r.daily_moment_id}` : `/moment/${r.daily_moment_id}/reveal`;
              return (
                <Link key={r.id} href={href} className="block">
                  <Card variant="interactive" className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <PhaseBadge phase={r.phase as "planned" | "trying" | "completed"} size="sm" />
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted-ink)]">
                            {r.daily_moments?.moment_date}
                          </span>
                        </div>
                        <p className="text-xl font-semibold tracking-[-0.025em] text-[var(--color-ink)]">
                          {r.daily_moments?.prompt}
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-muted-ink)]">
                          {r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}
                        </p>
                        {r.experience_note && (
                          <p className="mt-2 text-sm leading-6 text-[var(--color-muted-ink)] italic">
                            "{r.experience_note}"
                          </p>
                        )}
                        {r.experience_location_name && (
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-accent)]">
                            📍 {r.experience_location_name}
                          </p>
                        )}
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted-ink)]">
                        →
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
            {journeyOnly.map((j: any) => {
              const href = `/moment/${j.daily_moment_id}`;
              return (
                <Link key={j.id} href={href} className="block">
                  <Card variant="outlined" className="p-6 sm:p-7 opacity-75">
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <PhaseBadge phase={j.phase as "planned" | "trying" | "completed"} size="sm" />
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted-ink)]">
                            {j.daily_moments?.moment_date}
                          </span>
                        </div>
                        <p className="text-xl font-semibold tracking-[-0.025em] text-[var(--color-ink)]">
                          {j.daily_moments?.prompt}
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-muted-ink)]">
                          {phaseLabels[j.phase as keyof typeof phaseLabels] ?? "Awaiting your action"}
                        </p>
                        {j.phase === "trying" && (
                          <p className="mt-2 text-sm font-semibold text-[var(--color-accent)]">
                            Enter the Moment to continue →
                          </p>
                        )}
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted-ink)]">
                        →
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </>
        ) : (
          <Card variant="default" className="p-10 text-center">
            <p className="text-xl font-semibold text-[var(--color-ink)]">Nothing here yet.</p>
            <p className="mt-2 max-w-md mx-auto text-sm leading-6 text-[var(--color-muted-ink)]">
              Today&apos;s question is your first chance to make one.
            </p>
            <Link href="/">
              <Button size="lg" className="mt-7">
                GO TO MOMENT
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["planned", "trying", "completed"] as const).map((phase) => (
          <Card key={phase} variant="outlined" className="p-5 relative">
            <div className="absolute -top-3 left-6 w-10 h-10 rounded-full border-2 border-[var(--color-line)] bg-[var(--color-surface)] flex items-center justify-center">
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.08em] text-[var(--color-muted-ink)]">
                {phase === "planned" ? "1" : phase === "trying" ? "2" : "3"}
              </span>
            </div>
            <div className="pt-6">
              <PhaseBadge phase={phase} size="sm" className="mb-2" />
              <p className="text-sm leading-6 text-[var(--color-muted-ink)]">
                {phaseLabels[phase]}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
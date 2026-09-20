import Link from "next/link";
import { getTodayMoment, getWorldArchive } from "@/lib/db/v3";
import { Card } from "@/components/ui/Surface";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function WorldPage() {
  const [today, archive] = await Promise.all([getTodayMoment(), getWorldArchive()]);

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-16">
      <header className="max-w-3xl mb-12">
        <Badge variant="accent" className="mb-4">WORLD</Badge>
        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[0.9] tracking-[-0.04em] font-[var(--font-display)] text-[var(--color-ink)]">
          The world, over time.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-muted-ink)]">
          Every day leaves one question behind. Open a Moment and see how differently people answered it.
        </p>
      </header>

      <section className="mb-14">
        <Card variant="default" className="p-7 sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <Badge variant="outline" className="mb-4">TODAY</Badge>
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.04] tracking-[-0.02em] font-[var(--font-display)] text-[var(--color-ink)]">
                {today.prompt}
              </h2>
            </div>
            <span className="hidden h-12 w-12 shrink-0 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] sm:block" />
          </div>
          <Link href={`/moment/${today.id}/reveal`}>
            <Button fullWidth size="lg" className="mt-8">
              SEE TODAY'S WORLD
            </Button>
          </Link>
        </Card>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <Badge variant="outline" className="mb-2">ARCHIVE</Badge>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">Past Moments</h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted-ink)]">{archive.length} MOMENTS</span>
        </div>
        <Card variant="default" className="overflow-hidden divide-y divide-[var(--color-line)]">
          {archive.length ? archive.map((m: any) => (
            <Link key={m.id} href={`/moment/${m.id}/reveal`} className="flex items-center justify-between gap-5 p-6 hover:bg-[var(--color-line)]/30 transition-colors">
              <div>
                <Badge variant="outline" className="mb-3">{m.moment_date}</Badge>
                <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-ink)]">{m.prompt}</p>
                <Badge variant="default" className="mt-2">{m.status}</Badge>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] text-lg text-[var(--color-muted-ink)]">→</span>
            </Link>
          )) : (
            <div className="p-8 text-center">
              <p className="font-semibold text-[var(--color-ink)]">The archive starts tomorrow.</p>
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}
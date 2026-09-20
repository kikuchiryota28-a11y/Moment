import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTodayMoment, getWorldArchive } from "@/lib/db/v3";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Surface";

export default async function WorldPage() {
  const [today, archive] = await Promise.all([getTodayMoment(), getWorldArchive()]);
  return (
    <main className="moment-container py-8 pb-28 md:py-12 md:pb-16">
      <header className="border-b border-[var(--color-line-value)] pb-8">
        <p className="moment-eyebrow text-[var(--color-primary-value)]">World</p>
        <h1 className="moment-display mt-4 max-w-3xl text-5xl md:text-7xl">See what happened when other people entered.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-muted-ink-value)]">MOMENT is not a feed. It is a record of real actions, choices, and unexpected branches.</p>
      </header>

      <section className="py-10">
        <div className="rounded-[32px] bg-[var(--color-primary-value)] p-7 text-[var(--color-on-primary-value)] md:p-10">
          <p className="moment-eyebrow opacity-70">Today</p>
          <h2 className="moment-display mt-4 max-w-3xl text-4xl md:text-6xl">{today.prompt}</h2>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href={`/moment/${today.id}/reveal`}><Button variant="secondary" size="lg" icon={<ArrowUpRight size={18} />}>See today's world</Button></Link>
            <span className="text-sm opacity-75">{today.participantCount.toLocaleString()} people entered</span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="moment-eyebrow text-[var(--color-muted-ink-value)]">Archive</p><h2 className="mt-1 text-2xl font-semibold">Past Moments</h2></div>
          <span className="text-xs text-[var(--color-muted-ink-value)]">{archive.length} moments</span>
        </div>
        <div className="divide-y divide-[var(--color-line-value)] border-y border-[var(--color-line-value)]">
          {archive.length ? archive.map((m: { id: string; moment_date: string; prompt: string; status: string }) => (
            <Link key={m.id} href={`/moment/${m.id}/reveal`} className="group flex min-h-24 items-center justify-between gap-5 py-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-muted-ink-value)]">{m.moment_date}</p>
                <p className="mt-1 text-lg font-semibold tracking-[-0.02em] group-hover:text-[var(--color-primary-value)]">{m.prompt}</p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--color-surface-container-value)] transition-transform group-hover:-translate-y-0.5"><ArrowUpRight size={18} /></span>
            </Link>
          )) : <p className="py-10 text-sm text-[var(--color-muted-ink-value)]">The archive starts with your next Moment.</p>}
        </div>
      </section>
    </main>
  );
}

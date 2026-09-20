import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTodayMoment, getWorldArchive } from "@/lib/db/v3";
import { Button } from "@/components/ui/Button";

export default async function WorldPage() {
  const [today, archive] = await Promise.all([getTodayMoment(), getWorldArchive()]);
  return (
    <main className="moment-container py-8 pb-28 md:py-12 md:pb-16">
      <header className="border-b border-[var(--color-line-value)] pb-7">
        <p className="moment-eyebrow text-[var(--color-primary-value)]">World</p>
        <h1 className="moment-display mt-3 max-w-3xl text-5xl md:text-7xl">What happened?</h1>
      </header>

      <section className="py-8">
        <div className="rounded-[28px] bg-[var(--color-primary-value)] p-7 text-[var(--color-on-primary-value)] md:p-10">
          <p className="moment-eyebrow opacity-70">Today</p>
          <h2 className="moment-display mt-3 max-w-3xl text-4xl md:text-6xl">{today.prompt}</h2>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link href={`/moment/${today.id}/reveal`}><Button variant="secondary" size="lg" icon={<ArrowUpRight size={18} />}>See results</Button></Link>
            <span className="text-sm opacity-75">{today.participantCount.toLocaleString()} entered</span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div><p className="moment-eyebrow text-[var(--color-muted-ink-value)]">Archive</p><h2 className="mt-1 text-2xl font-semibold">Past Moments</h2></div>
          <span className="text-xs text-[var(--color-muted-ink-value)]">{archive.length}</span>
        </div>
        <div className="divide-y divide-[var(--color-line-value)] border-y border-[var(--color-line-value)]">
          {archive.length ? archive.map((m: { id: string; moment_date: string; prompt: string }) => (
            <Link key={m.id} href={`/moment/${m.id}/reveal`} className="group flex min-h-20 items-center justify-between gap-5 py-4">
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-muted-ink-value)]">{m.moment_date}</p>
                <p className="mt-1 truncate text-lg font-semibold tracking-[-0.02em] group-hover:text-[var(--color-primary-value)]">{m.prompt}</p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--color-surface-container-value)]"><ArrowUpRight size={18} /></span>
            </Link>
          )) : <p className="py-10 text-sm text-[var(--color-muted-ink-value)]">Nothing yet.</p>}
        </div>
      </section>
    </main>
  );
}

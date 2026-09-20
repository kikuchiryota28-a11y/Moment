import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTodayMoment, getWorldArchive } from "@/lib/db/v3";

export default async function WorldPage() {
  const [today, archive] = await Promise.all([getTodayMoment(), getWorldArchive()]);
  return (
    <main className="moment-container py-8 pb-28 md:py-12 md:pb-16">
      <header className="pb-8">
        <p className="moment-eyebrow text-[var(--color-accent)]">World</p>
        <h1 className="moment-display mt-3 max-w-2xl text-5xl md:text-7xl">What happened?</h1>
      </header>

      <section className="border-y border-[var(--color-line)] py-8 md:py-12">
        <p className="moment-eyebrow text-[var(--color-muted-ink)]">Today</p>
        <Link href={`/moment/${today.id}/reveal`} className="group mt-4 block max-w-4xl">
          <h2 className="moment-display text-4xl transition-colors group-hover:text-[var(--color-accent)] md:text-6xl">{today.prompt}</h2>
          <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-muted-ink)]">
            <span>{today.participantCount.toLocaleString()} entered</span>
            <ArrowUpRight size={17} aria-hidden="true" />
            <span>See results</span>
          </div>
        </Link>
      </section>

      <section className="pt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Archive</h2>
          <span className="text-xs text-[var(--color-muted-ink)]">{archive.length}</span>
        </div>
        <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {archive.length ? archive.map((m: { id: string; moment_date: string; prompt: string }) => (
            <Link key={m.id} href={`/moment/${m.id}/reveal`} className="group flex min-h-20 items-center justify-between gap-5 py-4">
              <div className="min-w-0">
                <p className="text-xs text-[var(--color-muted-ink)]">{m.moment_date}</p>
                <p className="mt-1 truncate text-lg font-semibold tracking-[-0.02em] group-hover:text-[var(--color-accent)]">{m.prompt}</p>
              </div>
              <ArrowUpRight size={18} className="shrink-0 text-[var(--color-muted-ink)]" aria-hidden="true" />
            </Link>
          )) : <p className="py-10 text-sm text-[var(--color-muted-ink)]">Nothing yet.</p>}
        </div>
      </section>
    </main>
  );
}
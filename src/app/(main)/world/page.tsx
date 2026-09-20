import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTodayMoment, getWorldArchive } from "@/lib/db/v3";

export default async function WorldPage() {
  const [today, archive] = await Promise.all([getTodayMoment(), getWorldArchive()]);
  return (
    <main className="moment-container py-8 pb-28 md:py-10">
      <header className="pt-10 pb-8 md:pt-16">
        <p className="moment-eyebrow text-[var(--color-accent)]">World</p>
        <h1 className="moment-display mt-3 max-w-2xl text-5xl md:text-7xl">What is happening?</h1>
      </header>

      <section className="mt-16 overflow-hidden rounded-[32px] bg-[var(--color-ink)] py-8 text-white shadow-[var(--shadow-deep)] md:mt-20 md:py-12 md:px-4">
        <p className="moment-eyebrow text-[var(--color-muted-ink)]">Today</p>
        <Link href={`/moment/${today.id}/reveal`} className="group block max-w-4xl px-4 md:px-6">
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
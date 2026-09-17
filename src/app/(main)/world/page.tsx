import Link from "next/link";
import { getTodayMoment, getWorldArchive } from "@/lib/db/v3";

const glassCard = "rounded-[32px] border border-white/70 bg-white/35 shadow-[0_30px_70px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl";

export default async function WorldPage() {
  const [today, archive] = await Promise.all([getTodayMoment(), getWorldArchive()]);

  return (
    <main className="mx-auto max-w-5xl py-10 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#EF6B35]">WORLD</p>
        <h1 className="mt-4 text-[clamp(44px,7vw,88px)] font-black leading-[0.9] tracking-[-0.065em] text-neutral-900">The world, over time.</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600">Every day leaves one question behind. Open a Moment and see how differently people answered it.</p>
      </header>

      <section className={`mt-12 p-7 sm:p-10 ${glassCard}`}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">TODAY</p>
            <h2 className="mt-4 max-w-2xl text-[clamp(26px,4vw,42px)] font-black leading-[1.04] tracking-[-0.04em] text-neutral-900">{today.prompt}</h2>
          </div>
          <span className="hidden h-12 w-12 shrink-0 rounded-full border border-white/70 bg-white/45 sm:block" />
        </div>
        <Link href={`/moment/${today.id}/reveal`} className="mt-8 inline-flex h-14 items-center rounded-[18px] bg-neutral-900 px-6 text-[11px] font-black uppercase tracking-[0.14em] text-[#FAF8F5] shadow-lg transition-transform active:scale-[0.98]">SEE TODAY&apos;S WORLD</Link>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">ARCHIVE</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-neutral-900">Past Moments</h2>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">{archive.length} MOMENTS</p>
        </div>
        <div className={`mt-5 overflow-hidden ${glassCard}`}>
          {archive.length ? archive.map((m: any) => (
            <Link key={m.id} href={`/moment/${m.id}/reveal`} className="group block border-b border-white/50 p-6 last:border-b-0 transition-colors hover:bg-white/20">
              <div className="flex items-center justify-between gap-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">{m.moment_date}</p>
                <span className="text-neutral-400 transition-transform group-hover:translate-x-1">→</span>
              </div>
              <p className="mt-3 text-lg font-black tracking-[-0.02em] text-neutral-900">{m.prompt}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">{m.status}</p>
            </Link>
          )) : <p className="p-8 text-sm text-neutral-500">The archive starts tomorrow.</p>}
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { getMyV3Results } from "@/lib/db/v3-journey";

const glassCard = "rounded-[32px] border border-white/70 bg-white/35 shadow-[0_30px_70px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl";

export default async function JourneyPage() {
  const results = await getMyV3Results();

  return (
    <main className="mx-auto max-w-5xl py-10 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#EF6B35]">JOURNEY</p>
        <h1 className="mt-4 text-[clamp(44px,7vw,88px)] font-black leading-[0.9] tracking-[-0.065em] text-neutral-900">What you made.</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600">Your answers, kept as a record of the moments you actually lived.</p>
      </header>

      <div className="mt-12 space-y-4">
        {results.length ? results.map((r: any) => (
          <Link key={r.id} href={`/moment/${r.daily_moment_id}/reveal`} className={`group block p-6 transition-transform duration-300 hover:-translate-y-0.5 sm:p-7 ${glassCard}`}>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">{r.daily_moments?.moment_date}</p>
                <p className="mt-3 text-xl font-black tracking-[-0.025em] text-neutral-900">{r.daily_moments?.prompt}</p>
                <p className="mt-3 text-sm text-neutral-600">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/45 text-lg text-neutral-700 shadow-sm transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        )) : (
          <div className={`p-10 text-center sm:p-14 ${glassCard}`}>
            <p className="text-xl font-black tracking-[-0.025em] text-neutral-900">Your first Moment is waiting.</p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-600">Start today and your lived experiences will begin forming your Journey.</p>
            <Link href="/" className="mt-7 inline-flex h-14 items-center rounded-[18px] bg-neutral-900 px-6 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg transition-transform active:scale-[0.98]">GO TO MOMENT</Link>
          </div>
        )}
      </div>
    </main>
  );
}

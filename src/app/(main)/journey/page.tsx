import Link from "next/link";
import { getMyV3Results, getMyV3Journeys } from "@/lib/db/v3-journey";

const glassCard = "rounded-[32px] border border-white/70 bg-white/35 shadow-[0_30px_70px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-xl";

const phaseColors = {
  planned: "text-[#ef6b35] bg-[#ef6b35]/10 border-[#ef6b35]/30",
  trying: "text-[#171614] bg-[#171614]/10 border-[#171614]/30",
  completed: "text-[#007a5e] bg-[#007a5e]/10 border-[#007a5e]/30",
};

const phaseLabels = {
  planned: "PLANNED — Discovered, not yet entered",
  trying: "TRYING — In the Moment, acting now",
  completed: "COMPLETED — Action committed, branch formed",
};

export default async function JourneyPage() {
  const [results, journeys] = await Promise.all([getMyV3Results(), getMyV3Journeys()]);

  // Merge results with journey phases
  const journeyMap = new Map(journeys.map(j => [j.daily_moment_id, j]));

  const merged = results.map(r => {
    const journey = journeyMap.get(r.daily_moment_id);
    return {
      ...r,
      phase: journey?.phase ?? "completed",
      experience_note: journey?.experience_note,
      experience_media_url: journey?.experience_media_url,
      experience_location_name: journey?.experience_location_name,
    };
  });

  // Also include journeys without results (planned/trying but not completed)
  const journeyOnly = journeys.filter(j => !journeyMap.has(j.daily_moment_id) || !results.some(r => r.daily_moment_id === j.daily_moment_id));

  return (
    <main className="mx-auto max-w-5xl py-10 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#EF6B35]">JOURNEY</p>
        <h1 className="mt-4 text-[clamp(44px,7vw,88px)] font-black leading-[0.9] tracking-[-0.065em] text-neutral-900">Your action loop.</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600">Each Moment you enter becomes a branch in your journey. PLANNED → TRYING → COMPLETED.</p>
      </header>

      <div className="mt-12 space-y-4">
        {merged.length > 0 || journeyOnly.length > 0 ? (
          <>
            {merged.map((r: any) => {
              const href = r.phase === "trying" ? `/moment/${r.daily_moment_id}` : `/moment/${r.daily_moment_id}/reveal`;
              return (
                <Link key={r.id} href={href} className={`group block p-6 transition-transform duration-300 hover:-translate-y-0.5 sm:p-7 ${glassCard}`}>
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em] border ${phaseColors[r.phase as keyof typeof phaseColors]}`}>
                          {r.phase.toUpperCase()}
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">{r.daily_moments?.moment_date}</p>
                      </div>
                      <p className="mt-3 text-xl font-black tracking-[-0.025em] text-neutral-900">{r.daily_moments?.prompt}</p>
                      <p className="mt-3 text-sm text-neutral-600">{r.result_type}{r.choice_value ? ` · ${r.choice_value}` : ""}</p>
                      {r.experience_note && <p className="mt-2 text-sm leading-6 text-[#777269] italic">“{r.experience_note}”</p>}
                      {r.experience_location_name && <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[#ef6b35]">📍 {r.experience_location_name}</p>}
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/45 text-lg text-neutral-700 shadow-sm transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              );
            })}
            {journeyOnly.map((j: any) => {
              const href = `/moment/${j.daily_moment_id}`;
              return (
                <Link key={j.id} href={href} className={`group block p-6 transition-transform duration-300 hover:-translate-y-0.5 sm:p-7 ${glassCard} opacity-75`}>
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.12em] border ${phaseColors[j.phase as keyof typeof phaseColors]}`}>
                          {j.phase?.toUpperCase() ?? "PLANNED"}
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">{j.daily_moments?.moment_date}</p>
                      </div>
                      <p className="mt-3 text-xl font-black tracking-[-0.025em] text-neutral-900">{j.daily_moments?.prompt}</p>
                      <p className="mt-3 text-sm text-neutral-600">{phaseLabels[j.phase as keyof typeof phaseLabels] ?? "Awaiting your action"}</p>
                      {j.phase === "trying" && <p className="mt-2 text-sm font-bold text-[#ef6b35]">Enter the Moment to continue →</p>}
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/45 text-lg text-neutral-700 shadow-sm">→</span>
                  </div>
                </Link>
              );
            })}
          </>
        ) : (
          <div className={`p-10 text-center sm:p-14 ${glassCard}`}>
            <p className="text-xl font-black tracking-[-0.025em] text-neutral-900">Your first Moment is waiting.</p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-600">Start today and your lived experiences will begin forming your Journey.</p>
            <Link href="/" className="mt-7 inline-flex h-14 items-center rounded-[18px] bg-neutral-900 px-6 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg transition-transform active:scale-[0.98]">GO TO MOMENT</Link>
          </div>
        )}
      </div>

      {/* Action Loop Legend */}
      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(["planned", "trying", "completed"] as const).map((phase) => (
          <div key={phase} className={`rounded-[24px] p-5 border-2 ${phaseColors[phase]} relative`}>
            <div className="absolute -top-3 left-6 w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: phaseColors[phase].split(" ")[2] }}>
              <span className="text-[10px] font-black uppercase tracking-[0.08em]" style={{ color: phaseColors[phase].split(" ")[0] }}>
                {phase === "planned" ? "1" : phase === "trying" ? "2" : "3"}
              </span>
            </div>
            <p className="pt-6 text-xs font-black uppercase tracking-[0.12em]">{phase.toUpperCase()}</p>
            <p className="mt-2 text-sm leading-6">{phaseLabels[phase]}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
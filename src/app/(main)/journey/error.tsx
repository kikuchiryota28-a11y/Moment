"use client";

export default function JourneyError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-20 text-center">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef6b35]">Journey</p>
      <h1 className="mt-3 text-2xl font-black">Journeyを読み込めませんでした</h1>
      <button onClick={() => reset()} className="mt-6 rounded-xl bg-[#171614] px-5 py-3 text-sm font-black text-white">
        Try again
      </button>
    </div>
  );
}

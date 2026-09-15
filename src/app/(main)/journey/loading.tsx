export default function JourneyLoading() {
  return (
    <div className="py-5 sm:py-10" aria-busy="true" aria-label="Loading Journey">
      <div className="mb-7 space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-[#ded8ce]" />
        <div className="h-10 w-40 animate-pulse rounded bg-[#ded8ce]" />
        <div className="h-4 w-64 animate-pulse rounded bg-[#e9e2d7]" />
      </div>
      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-9 w-20 animate-pulse rounded-full bg-[#e9e2d7]" />)}
      </div>
      <div className="space-y-3">
        {[1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-3xl border border-[#ded8ce] bg-white/60" />)}
      </div>
    </div>
  );
}

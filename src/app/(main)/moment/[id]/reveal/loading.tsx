import { ResultCardSkeleton } from "@/components/ui/Skeleton";

export default function RevealLoading() {
  return (
    <div className="relative min-h-[100dvh] bg-[var(--color-canvas)] px-6 py-12 lg:px-12 lg:py-20" aria-busy="true" aria-label="Loading Reveal">
      <div className="mx-auto max-w-[1440px]">
        <ResultCardSkeleton />
        <ResultCardSkeleton />
        <ResultCardSkeleton />
      </div>
    </div>
  );
}
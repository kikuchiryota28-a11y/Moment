import { MomentCardSkeleton } from "@/components/ui/Skeleton";

export default function MomentDetailLoading() {
  return (
    <div className="relative min-h-[100dvh] bg-[var(--color-canvas)] px-6 py-12 lg:px-12 lg:py-20" aria-busy="true" aria-label="Loading Moment">
      <MomentCardSkeleton />
    </div>
  );
}
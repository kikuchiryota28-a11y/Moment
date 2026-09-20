import { MomentCardSkeleton } from "@/components/ui/Skeleton";

export default function MainLoading() {
  return (
    <div className="relative min-h-[100dvh] bg-[var(--color-canvas)] px-6 py-8 lg:px-12" aria-busy="true" aria-label="Loading">
      <MomentCardSkeleton />
      <MomentCardSkeleton />
      <MomentCardSkeleton />
    </div>
  );
}
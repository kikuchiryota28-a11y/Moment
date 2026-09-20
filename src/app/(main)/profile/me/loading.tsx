import { ProfileHeaderSkeleton, JourneyRowSkeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="relative min-h-[100dvh] bg-[var(--color-canvas)] px-6 py-12 lg:px-12 lg:py-16" aria-busy="true" aria-label="Loading Profile">
      <div className="mx-auto max-w-[1440px]">
        <ProfileHeaderSkeleton />
        <JourneyRowSkeleton />
        <JourneyRowSkeleton />
      </div>
    </div>
  );
}
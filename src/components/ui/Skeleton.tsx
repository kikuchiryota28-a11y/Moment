"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ className, variant = "text", width, height, lines = 1, ...props }: SkeletonProps) {
  if (variant === "circular") {
    return (
      <div
        className={cn("rounded-full bg-[var(--color-line)] animate-pulse", className)}
        style={{ width, height, minWidth: width, minHeight: height }}
        {...props}
      />
    );
  }

  if (variant === "rectangular") {
    return (
      <div
        className={cn("rounded-[12px] bg-[var(--color-line)] animate-pulse", className)}
        style={{ width, height }}
        {...props}
      />
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)} {...props}>
        <div className="h-6 w-3/4 rounded-[8px] bg-[var(--color-line)] animate-pulse" />
        <div className="h-10 w-full rounded-[12px] bg-[var(--color-line)] animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded-[8px] bg-[var(--color-line)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn("rounded-[8px] bg-[var(--color-line)] animate-pulse", i === lines - 1 && "w-3/4")}
          style={{ height: "1rem" }}
        />
      ))}
    </div>
  );
}

export function MomentCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 rounded-full bg-[var(--color-line)]" />
            <div className="h-4 w-20 rounded-full bg-[var(--color-line)]" />
          </div>
          <div className="mt-4 h-8 w-3/4 rounded-[12px] bg-[var(--color-line)]" />
        </div>
        <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--color-line)]" />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-24 rounded-[10px] bg-[var(--color-line)]" />
        <div className="h-10 w-24 rounded-[10px] bg-[var(--color-line)]" />
      </div>
    </div>
  );
}

export function ResultCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 rounded-full bg-[var(--color-line)]" />
            <div className="h-4 w-16 rounded-full bg-[var(--color-line)]" />
          </div>
          <div className="mt-3 h-6 w-3/4 rounded-[8px] bg-[var(--color-line)]" />
          <div className="mt-3 h-20 w-full rounded-[16px] bg-[var(--color-line)]" />
        </div>
        <div className="h-11 w-11 shrink-0 rounded-full bg-[var(--color-line)]" />
      </div>
    </div>
  );
}

export function JourneyRowSkeleton() {
  return (
    <div className="rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 rounded-full bg-[var(--color-line)]" />
            <div className="h-4 w-24 rounded-full bg-[var(--color-line)]" />
          </div>
          <div className="mt-3 h-7 w-3/4 rounded-[8px] bg-[var(--color-line)]" />
          <div className="mt-2 h-4 w-1/2 rounded-[8px] bg-[var(--color-line)]" />
        </div>
        <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--color-line)]" />
      </div>
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[var(--color-line)]" />
        <div className="flex-1">
          <div className="h-4 w-16 rounded-[8px] bg-[var(--color-line)]" />
          <div className="mt-2 h-8 w-2/3 rounded-[8px] bg-[var(--color-line)]" />
          <div className="mt-1 h-4 w-1/3 rounded-[8px] bg-[var(--color-line)]" />
        </div>
        <div className="h-10 w-20 rounded-[10px] bg-[var(--color-line)]" />
      </div>
    </div>
  );
}

export function WorldSectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-4 w-16 rounded-[8px] bg-[var(--color-line)]" />
        <div className="mt-4 h-12 w-3/4 rounded-[8px] bg-[var(--color-line)]" />
        <div className="mt-4 h-6 w-1/2 rounded-[8px] bg-[var(--color-line)]" />
      </div>
      <div className="rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-3 w-12 rounded-full bg-[var(--color-line)]" />
            <div className="mt-4 h-8 w-3/4 rounded-[12px] bg-[var(--color-line)]" />
          </div>
          <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--color-line)]" />
        </div>
        <div className="mt-8 h-12 w-48 rounded-[14px] bg-[var(--color-line)]" />
      </div>
      <div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="h-3 w-12 rounded-full bg-[var(--color-line)]" />
            <div className="mt-2 h-7 w-2/3 rounded-[8px] bg-[var(--color-line)]" />
          </div>
          <div className="h-3 w-16 rounded-full bg-[var(--color-line)]" />
        </div>
        <div className="mt-5 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[20px] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="h-3 w-12 rounded-full bg-[var(--color-line)]" />
                <div className="h-3 w-3 rounded-full bg-[var(--color-line)]" />
              </div>
              <div className="mt-3 h-6 w-3/4 rounded-[8px] bg-[var(--color-line)]" />
              <div className="mt-2 h-4 w-1/2 rounded-[8px] bg-[var(--color-line)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
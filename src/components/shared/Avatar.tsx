"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = 40,
  priority = false,
  className = "",
}: { src?: string | null; name: string; size?: number; priority?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const safeSrc = useMemo(() => {
    if (!src || !src.trim()) return null;
    try {
      const url = new URL(src);
      return url.protocol === "https:" ? url.toString() : null;
    } catch {
      return null;
    }
  }, [src]);
  useEffect(() => setFailed(false), [safeSrc]);
  const initials = name.trim().slice(0, 1).toUpperCase() || "?";
  const dimension = `${size}px`;

  if (!safeSrc || failed) {
    return (
      <div
        aria-label={name}
        className={cn(
          "aspect-square min-w-0 shrink-0 overflow-hidden rounded-full flex items-center justify-center bg-[var(--color-ink)] font-black text-[var(--color-overlay)]",
          className
        )}
        style={{ width: dimension, height: dimension, minWidth: dimension, minHeight: dimension, maxWidth: dimension, maxHeight: dimension, fontSize: Math.max(12, Math.round(size * 0.38)) }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn("relative aspect-square min-w-0 shrink-0 overflow-hidden rounded-full", className)}
      style={{ width: dimension, height: dimension, minWidth: dimension, minHeight: dimension, maxWidth: dimension, maxHeight: dimension }}
    >
      <Image
        src={safeSrc}
        alt={name}
        fill
        priority={priority}
        sizes={`${size}px`}
        onError={() => setFailed(true)}
        className="h-full w-full min-h-full min-w-full shrink-0 aspect-square rounded-full object-cover"
      />
    </div>
  );
}
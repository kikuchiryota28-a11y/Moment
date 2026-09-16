"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export function Avatar({ src, name, size = 40, priority = false, className = "" }: { src?: string | null; name: string; size?: number; priority?: boolean; className?: string }) {
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
  if (!safeSrc || failed) return <div aria-label={name} className={`flex shrink-0 items-center justify-center rounded-full bg-[#171614] font-black text-white ${className}`} style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.38)) }}>{initials}</div>;
  return <Image src={safeSrc} alt={name} width={size} height={size} priority={priority} sizes={`${size}px`} onError={() => setFailed(true)} className={`shrink-0 rounded-full object-cover ${className}`} />;
}

"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: "ground" | "surface" | "elevated" | "overlay";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const padding = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { className, elevation = "surface", padding: pad = "md", interactive, ...props }, ref
) {
  const surface = {
    ground: "bg-transparent",
    surface: "bg-[var(--color-surface-value)]",
    elevated: "bg-[var(--color-surface-container-value)]",
    overlay: "bg-[var(--color-surface-value)] shadow-[0_12px_40px_rgba(0,0,0,.10)]",
  }[elevation];
  return <div ref={ref} className={cn("rounded-[28px]", surface, padding[pad], interactive && "transition-transform hover:-translate-y-0.5", className)} {...props} />;
});

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { variant?: "default" | "interactive" | "outlined"; padding?: "none" | "sm" | "md" | "lg" }>(
  function Card({ className, variant = "default", padding: pad = "md", ...props }, ref) {
    const variantClass = {
      default: "bg-[var(--color-surface-value)]",
      interactive: "bg-[var(--color-surface-value)] transition-transform hover:-translate-y-0.5",
      outlined: "bg-transparent border border-[var(--color-line-value)]",
    }[variant];
    return <div ref={ref} className={cn("rounded-[28px]", variantClass, padding[pad], className)} {...props} />;
  }
);

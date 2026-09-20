"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: "ground" | "surface" | "elevated" | "overlay";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const elevationStyles = {
  ground: "bg-[var(--color-canvas)]",
  surface: "border border-[var(--color-line)]/80 bg-[var(--color-surface)]",
  elevated: "border border-white/30 bg-[color-mix(in_srgb,var(--color-surface)_76%,transparent)] shadow-[var(--shadow-elevated)] backdrop-blur-xl",
  overlay: "border border-white/40 bg-[color-mix(in_srgb,var(--color-overlay)_84%,transparent)] shadow-[var(--shadow-overlay)] backdrop-blur-2xl",
};

const paddingStyles = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, elevation = "surface", padding = "md", interactive, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-[20px]",
        elevationStyles[elevation],
        paddingStyles[padding],
        interactive && "transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Surface.displayName = "Surface";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const cardVariants = {
  default: "border border-[var(--color-line)]/80 bg-[var(--color-surface)]",
  interactive: "border border-[var(--color-line)]/80 bg-[var(--color-surface)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-surface)]",
  outlined: "border border-[var(--color-line)] bg-transparent",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-[18px]", cardVariants[variant], paddingStyles[padding], className)} {...props}>
      {children}
    </div>
  )
);
Card.displayName = "Card";
"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

const variantStyles = {
  default: "bg-[var(--color-muted-ink)]/10 text-[var(--color-muted-ink)] border-transparent",
  accent: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-transparent",
  success: "bg-[var(--color-success)]/10 text-[var(--color-success)] border-transparent",
  warning: "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-transparent",
  danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-transparent",
  outline: "bg-transparent text-[var(--color-muted-ink)] border-[var(--color-line)]",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-3 py-1 text-[11px] gap-1.5",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-semibold rounded-full border transition-colors duration-200",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export interface PhaseBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  phase: "planned" | "trying" | "completed" | "discover" | "enter" | "action" | "result" | "branch";
  size?: "sm" | "md";
}

const phaseConfig = {
  planned: { variant: "accent" as const, label: "PLANNED", dot: true },
  trying: { variant: "default" as const, label: "TRYING", dot: true },
  completed: { variant: "success" as const, label: "COMPLETED", dot: true },
  discover: { variant: "outline" as const, label: "DISCOVER", dot: false },
  enter: { variant: "accent" as const, label: "ENTER", dot: false },
  action: { variant: "default" as const, label: "ACTION", dot: false },
  result: { variant: "success" as const, label: "RESULT", dot: false },
  branch: { variant: "accent" as const, label: "BRANCH", dot: false },
};

export const PhaseBadge = forwardRef<HTMLSpanElement, PhaseBadgeProps>(
  ({ className, phase, size = "md", ...props }, ref) => {
    const config = phaseConfig[phase];
    return (
      <Badge
        ref={ref}
        variant={config.variant}
        size={size}
        dot={config.dot}
        className={cn("font-black uppercase tracking-[0.08em]", className)}
        {...props}
      >
        {config.label}
      </Badge>
    );
  }
);

PhaseBadge.displayName = "PhaseBadge";
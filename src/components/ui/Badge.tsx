"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

const variants = {
  default: "bg-[var(--color-surface-container-value)] text-[var(--color-muted-ink-value)]",
  accent: "bg-[var(--color-primary-container-value)] text-[var(--color-ink-value)]",
  success: "bg-[color-mix(in_srgb,var(--color-success-value)_14%,transparent)] text-[var(--color-success-value)]",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-900",
  outline: "border border-[var(--color-line-value)] text-[var(--color-muted-ink-value)]",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = "default", size = "md", dot, children, ...props }, ref
) {
  return <span ref={ref} className={cn("inline-flex items-center gap-1.5 rounded-full font-semibold", size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs", variants[variant], className)} {...props}>{dot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}{children}</span>;
});

export interface PhaseBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  phase: "planned" | "trying" | "completed" | "discover" | "enter" | "action" | "result" | "branch" | "closed";
  size?: "sm" | "md";
}
const phaseConfig = {
  planned: ["accent","PLANNED",true], trying:["default","TRYING",true], completed:["success","COMPLETED",true],
  discover:["outline","DISCOVER",false], enter:["accent","ENTER",false], action:["default","ACTION",false],
  result:["success","RESULT",false], branch:["accent","BRANCH",false], closed:["default","CLOSED",false],
} as const;

export const PhaseBadge = forwardRef<HTMLSpanElement, PhaseBadgeProps>(function PhaseBadge({ phase, size="md", className, ...props }, ref) {
  const [variant,label,dot] = phaseConfig[phase];
  return <Badge ref={ref} variant={variant} size={size} dot={dot} className={cn("uppercase tracking-[0.08em]", className)} {...props}>{label}</Badge>;
});

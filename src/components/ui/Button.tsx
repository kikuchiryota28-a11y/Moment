"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variants = {
  primary: "bg-[var(--color-primary-value)] text-[var(--color-on-primary-value)] hover:brightness-95",
  secondary: "bg-[var(--color-surface-container-value)] text-[var(--color-ink-value)] hover:bg-[var(--color-surface-high-value)]",
  ghost: "bg-transparent text-[var(--color-ink-value)] hover:bg-[var(--color-surface-container-value)]",
  danger: "bg-[var(--color-danger-value)] text-white hover:brightness-95",
};

const sizes = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, icon, iconPosition = "left", fullWidth, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-value)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas-value)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45",
        variants[variant], sizes[size], fullWidth && "w-full", className
      )}
      {...props}
    >
      {loading ? <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : icon && iconPosition === "left" ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
      {icon && iconPosition === "right" && !loading ? <span aria-hidden="true">{icon}</span> : null}
    </button>
  );
});

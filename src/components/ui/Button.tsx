"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles = {
  primary: "bg-[var(--color-ink)] text-[var(--color-overlay)] hover:opacity-90 active:opacity-80",
  secondary: "border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-elevated)] active:bg-[var(--color-line)]",
  ghost: "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-line)]/60 active:bg-[var(--color-line)]",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90 active:opacity-80",
};

const sizeStyles = {
  sm: "min-h-10 rounded-xl px-4 text-sm gap-2",
  md: "min-h-11 rounded-xl px-5 text-sm gap-2.5",
  lg: "min-h-12 rounded-[14px] px-6 text-base gap-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, iconPosition = "left", fullWidth, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-[background-color,opacity,transform] duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]",
          "disabled:pointer-events-none disabled:opacity-45",
          "active:scale-[0.985]",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="size-4 animate-pulse rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
        ) : icon && iconPosition === "left" ? (
          <span className="shrink-0" aria-hidden="true">{icon}</span>
        ) : null}
        <span>{children}</span>
        {icon && iconPosition === "right" && !loading && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
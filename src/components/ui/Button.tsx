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
  primary: "bg-[var(--color-ink)] text-[var(--color-overlay)] hover:bg-[var(--color-ink)]/90 active:bg-[var(--color-ink)] focus-visible:ring-[var(--color-ink)]",
  secondary: "bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-line)] hover:bg-[var(--color-elevated)] focus-visible:ring-[var(--color-line)]",
  ghost: "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-line)] focus-visible:ring-[var(--color-line)]",
  danger: "bg-[var(--color-danger)] text-[var(--color-overlay)] hover:bg-[var(--color-danger)]/90 active:bg-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
};

const sizeStyles = {
  sm: "min-h-[40px] px-4 text-sm gap-2",
  md: "min-h-[48px] px-5 text-sm gap-2.5",
  lg: "min-h-[56px] px-6 text-base gap-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, iconPosition = "left", fullWidth, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-[14px] transition-all duration-[120ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : icon && iconPosition === "left" ? (
          <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
        ) : null}
        <span>{children}</span>
        {icon && iconPosition === "right" && !loading && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
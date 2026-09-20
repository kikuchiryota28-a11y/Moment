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
  surface: "bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-surface)]",
  elevated: "bg-[var(--color-elevated)] border border-[var(--color-line)] shadow-[var(--shadow-elevated)] backdrop-blur-md",
  overlay: "bg-[var(--color-overlay)] border border-[var(--color-line)] shadow-[var(--shadow-overlay)] backdrop-blur-xl",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, elevation = "surface", padding = "md", interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[20px] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          elevationStyles[elevation],
          paddingStyles[padding],
          interactive && "hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = "Surface";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const cardVariants = {
  default: "bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-surface)]",
  interactive: "bg-[var(--color-surface)] border border-[var(--color-line)] shadow-[var(--shadow-surface)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
  outlined: "bg-transparent border-2 border-[var(--color-line)] hover:border-[var(--color-accent)] transition-colors duration-200",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[20px]",
          cardVariants[variant],
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
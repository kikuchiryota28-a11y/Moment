"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-ink)] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={cn(errorId, hintId)}
          className={cn(
            "w-full min-h-[48px] px-4 text-base rounded-[14px] bg-[var(--color-surface)] border transition-all duration-[120ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            "placeholder:text-[var(--color-muted-ink)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]"
              : "border-[var(--color-line)] hover:border-[var(--color-muted-ink)]/50",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-2 text-sm font-medium text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-2 text-sm text-[var(--color-muted-ink)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, maxLength, id, value, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const hintId = hint ? `${textareaId}-hint` : undefined;

    const valueLength = typeof value === "string" ? value.length : Array.isArray(value) ? value[0]?.length || 0 : 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--color-ink)] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={cn(errorId, hintId)}
            className={cn(
              "w-full min-h-[120px] px-4 py-4 text-base rounded-[14px] bg-[var(--color-surface)] border transition-all duration-[120ms] ease-[cubic-bezier(0.16,1,0.3,1)] resize-none",
              "placeholder:text-[var(--color-muted-ink)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]"
                : "border-[var(--color-line)] hover:border-[var(--color-muted-ink)]/50",
              className
            )}
            value={value}
            {...props}
          />
          {maxLength && (
            <div className="absolute bottom-3 right-3 text-xs text-[var(--color-muted-ink)]">
              {valueLength}/{maxLength}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-2 text-sm font-medium text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-2 text-sm text-[var(--color-muted-ink)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[var(--color-ink)] mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={cn(errorId, hintId)}
          className={cn(
            "w-full min-h-[48px] px-4 py-2 text-base rounded-[14px] bg-[var(--color-surface)] border appearance-none transition-all duration-[120ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]"
              : "border-[var(--color-line)] hover:border-[var(--color-muted-ink)]/50",
            className
          )}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="mt-2 text-sm font-medium text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-2 text-sm text-[var(--color-muted-ink)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
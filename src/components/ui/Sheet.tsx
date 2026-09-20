"use client";

import { forwardRef, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "bottom" | "right" | "left";
  size?: "sm" | "md" | "lg" | "full";
  title?: string;
  description?: string;
  showHandle?: boolean;
}

const sideStyles = {
  bottom: "bottom-0 left-0 right-0 rounded-t-[28px]",
  right: "right-0 top-0 bottom-0 rounded-l-[28px]",
  left: "left-0 top-0 bottom-0 rounded-r-[28px]",
};

const sizeStyles = {
  bottom: {
    sm: "max-h-[40vh]",
    md: "max-h-[60vh]",
    lg: "max-h-[80vh]",
    full: "max-h-[90vh]",
  },
  right: {
    sm: "w-[320px]",
    md: "w-[400px]",
    lg: "w-[520px]",
    full: "w-[640px]",
  },
  left: {
    sm: "w-[320px]",
    md: "w-[400px]",
    lg: "w-[520px]",
    full: "w-[640px]",
  },
};

const animations = {
  bottom: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  },
  right: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  left: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
  },
};

export function Sheet({ open, onClose, children, side = "bottom", size = "md", title, description, showHandle = true }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={animations[side].initial}
            animate={animations[side].animate}
            exit={animations[side].exit}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed z-50 flex flex-col bg-[var(--color-overlay)] border border-[var(--color-line)] shadow-[var(--shadow-overlay)] backdrop-blur-xl",
              sideStyles[side],
              sizeStyles[side][size]
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "sheet-title" : undefined}
            aria-describedby={description ? "sheet-description" : undefined}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-line)]">
              <div>
                {title && (
                  <h2 id="sheet-title" className="text-lg font-semibold text-[var(--color-ink)]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="sheet-description" className="mt-1 text-sm text-[var(--color-muted-ink)]">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[var(--color-line)] transition-colors text-[var(--color-muted-ink)]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            {showHandle && side === "bottom" && (
              <div className="flex justify-center px-4 pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-[var(--color-line)]" aria-hidden="true" />
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
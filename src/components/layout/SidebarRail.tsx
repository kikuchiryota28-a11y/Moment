"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Globe2, Compass, UserRound, ChevronLeft, ChevronRight } from "lucide-react";

const items = [
  { href: "/", label: "MOMENT", icon: Sparkles },
  { href: "/world", label: "WORLD", icon: Globe2 },
  { href: "/journey", label: "JOURNEY", icon: Compass },
  { href: "/profile/me", label: "YOU", icon: UserRound },
];

export function SidebarRail() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  if (typeof window !== "undefined" && window.innerWidth < 768) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-[100dvh] bg-[var(--color-surface)] border-r border-[var(--color-line)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col",
        expanded ? "w-[240px]" : "w-[72px]"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--color-line)]">
        <motion.span
          initial={false}
          animate={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0 }}
          style={{ overflow: "hidden", whiteSpace: "nowrap" }}
          className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-accent)]"
        >
          MOMENT<span className="text-[var(--color-accent)]">.</span>
        </motion.span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-1.5 rounded-xl hover:bg-[var(--color-line)] transition-colors text-[var(--color-muted-ink)]"
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={expanded}
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 rounded-[14px] px-3 py-3 text-sm font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                active
                  ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                  : "text-[var(--color-muted-ink)] hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={2.2} className="flex-shrink-0" aria-hidden="true" />
              <AnimatePresence mode="popLayout">
                {expanded && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, x: -10, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: "auto" }}
                    exit={{ opacity: 0, x: -10, width: 0 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    style={{ whiteSpace: "nowrap", overflow: "hidden" }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && (
                <motion.div
                  initial={false}
                  animate={{ width: expanded ? "4px" : "100%" }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "absolute left-0 top-1 bottom-1 rounded-[10px] bg-[var(--color-accent)]",
                    expanded ? "left-0" : "left-0 right-0"
                  )}
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--color-line)]">
        <AnimatePresence mode="popLayout">
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-muted-ink)]"
            >
              v0.3.0
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Globe2, Compass, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "MOMENT", icon: Sparkles },
  { href: "/world", label: "WORLD", icon: Globe2 },
  { href: "/journey", label: "JOURNEY", icon: Compass },
  { href: "/profile/me", label: "YOU", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();

  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-overlay)] border-t border-[var(--color-line)] backdrop-blur-xl px-3 pb-safe pt-3 lg:hidden"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around gap-1 max-w-[520px] mx-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-[14px] px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] min-w-[60px]",
                active ? "text-[var(--color-accent)]" : "text-[var(--color-muted-ink)]"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative z-10 flex items-center justify-center">
                <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <motion.span
                initial={false}
                animate={{ opacity: active ? 1 : 0, y: active ? 0 : 4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                {label}
              </motion.span>
              {active && (
                <motion.div
                  initial={false}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-[var(--color-accent)]"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
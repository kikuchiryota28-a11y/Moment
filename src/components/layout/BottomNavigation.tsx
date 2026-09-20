"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sparkles, Globe2, Compass, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "Moment", icon: Sparkles },
  { href: "/world", label: "World", icon: Globe2 },
  { href: "/journey", label: "Journey", icon: Compass },
  { href: "/profile/me", label: "You", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)]/80 bg-[color-mix(in_srgb,var(--color-overlay)_88%,transparent)] px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]",
                active ? "text-[var(--color-ink)]" : "text-[var(--color-muted-ink)]"
              )}
            >
              {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />}
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
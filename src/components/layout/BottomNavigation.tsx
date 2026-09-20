"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Globe2, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Moment", icon: Sparkles },
  { href: "/world", label: "World", icon: Globe2 },
  { href: "/journey", label: "Journey", icon: Compass },
  { href: "/profile/me", label: "You", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line-value)] bg-[color-mix(in_srgb,var(--color-surface-value)_94%,transparent)] px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden" aria-label="Main navigation">
      <div className="mx-auto grid max-w-[520px] grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition-colors",
                active ? "text-[var(--color-primary-value)]" : "text-[var(--color-muted-ink-value)]"
              )}
            >
              <span className={cn("grid size-9 place-items-center rounded-full", active && "bg-[var(--color-primary-container-value)]")}>
                <Icon size={19} strokeWidth={2} aria-hidden="true" />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

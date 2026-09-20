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

export function SidebarRail() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[72px] border-r border-[var(--color-line)]/80 bg-[color-mix(in_srgb,var(--color-overlay)_70%,transparent)] backdrop-blur-2xl md:block" aria-label="Main navigation">
      <div className="flex h-full flex-col items-center py-5">
        <Link href="/" aria-label="MOMENT home" className="grid size-10 place-items-center rounded-xl text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]">
          <span className="text-sm font-black tracking-[-0.08em]">M</span>
        </Link>

        <nav className="mt-10 flex flex-1 flex-col items-center gap-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                title={label}
                className={cn(
                  "relative grid size-11 place-items-center rounded-xl transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]",
                  active ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]" : "text-[var(--color-muted-ink)] hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                {active && <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <span className="text-[9px] font-medium tracking-[0.08em] text-[var(--color-muted-ink)]" aria-hidden="true">M</span>
      </div>
    </aside>
  );
}
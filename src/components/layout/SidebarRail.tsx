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

export function SidebarRail() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[var(--color-line-value)] bg-[color-mix(in_srgb,var(--color-surface-value)_88%,transparent)] backdrop-blur-xl md:flex md:flex-col">
      <div className="flex h-20 items-center px-7">
        <Link href="/" className="group flex min-h-11 items-center gap-2 rounded-full px-2 font-bold tracking-[-0.02em]">
          <span className="grid size-9 place-items-center rounded-full bg-[var(--color-primary-value)] text-[var(--color-on-primary-value)] transition-transform group-hover:scale-105">
            <Sparkles size={17} aria-hidden="true" />
          </span>
          <span>MOMENT</span>
        </Link>
      </div>

      <nav className="px-4 pt-4" aria-label="Main navigation">
        <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted-ink-value)]">Explore</p>
        <div className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors duration-150",
                  active
                    ? "bg-[var(--color-primary-container-value)] text-[var(--color-ink-value)]"
                    : "text-[var(--color-muted-ink-value)] hover:bg-[var(--color-surface-container-value)] hover:text-[var(--color-ink-value)]"
                )}
              >
                <Icon size={20} strokeWidth={2} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto px-7 pb-7">
        <div className="rounded-[16px] bg-[var(--color-surface-container-value)] p-4">
          <p className="text-sm font-semibold">Don't just watch.</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-muted-ink-value)]">Be what happens.</p>
        </div>
      </div>
    </aside>
  );
}

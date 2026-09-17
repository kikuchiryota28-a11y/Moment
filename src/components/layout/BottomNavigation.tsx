"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Globe2, Sparkles, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "MOMENT", icon: Sparkles },
  { href: "/world", label: "WORLD", icon: Globe2 },
  { href: "/journey", label: "JOURNEY", icon: Compass },
  { href: "/profile/me", label: "YOU", icon: UserRound },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100vw-24px)] max-w-[520px] -translate-x-1/2 rounded-[24px] border border-white/60 bg-white/40 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
      <div className="grid h-[64px] grid-cols-4 items-center">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex h-full flex-col items-center justify-center gap-1 rounded-[18px] text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-300 ${active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-800"}`}
            >
              {active && <span className="absolute inset-1 rounded-[16px] bg-white/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]" />}
              <Icon size={18} strokeWidth={2.2} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

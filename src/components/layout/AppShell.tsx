"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { SidebarRail } from "@/components/layout/SidebarRail";
import { CanvasProvider } from "@/components/layout/CanvasProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <CanvasProvider>
      <div className="relative min-h-[100dvh] overflow-x-clip bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <div className="moment-atmosphere" aria-hidden="true">
          <div className="moment-aura-left" />
          <div className="moment-aura-right" />
        </div>

        <div className="relative z-10 flex min-h-[100dvh]">
          <SidebarRail />
          <main className="min-w-0 flex-1 md:pl-0 lg:pl-[72px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.18, ease: [0.2, 0, 0, 1] }}
                className="min-h-[100dvh] pb-24 md:pb-0"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <BottomNavigation />
      </div>
    </CanvasProvider>
  );
}
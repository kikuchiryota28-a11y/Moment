"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { SidebarRail } from "@/components/layout/SidebarRail";
import { CanvasProvider } from "@/components/layout/CanvasProvider";

const routeTransition = {
  type: "spring" as const,
  stiffness: 280,
  damping: 30,
  mass: 0.9,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <CanvasProvider>
      <div className="relative min-h-[100dvh] bg-[var(--color-canvas)] text-[var(--color-ink)]">
        <div className="relative z-10 flex min-h-[100dvh]">
          <SidebarRail />
          <main className="flex-1 min-w-0 lg:pl-0">
            <div className="relative min-h-[100dvh]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 16, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.998 }}
                  transition={routeTransition}
                  className="min-h-[100dvh] pb-24 lg:pb-0"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        <BottomNavigation />
      </div>
    </CanvasProvider>
  );
}
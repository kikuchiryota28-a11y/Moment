"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

const routeSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
  mass: 0.9,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user" transition={routeSpring}>
      <div className="relative min-h-[100dvh] overflow-hidden bg-[#F5F2EC] text-neutral-900">
        <div
          className="fixed inset-0 z-0 overflow-hidden"
          style={{ background: "radial-gradient(circle at 50% 30%, #F5F2EC 0%, #E2DDD3 100%)" }}
          aria-hidden="true"
        >
          <div className="pointer-events-none absolute -left-[18vw] top-[8vh] h-[42vh] w-[42vw] rounded-full bg-white/45 blur-[100px] animate-[moment-aura-left_14s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute -right-[16vw] bottom-[4vh] h-[46vh] w-[46vw] rounded-full bg-white/35 blur-[100px] animate-[moment-aura-right_17s_ease-in-out_infinite]" />
          <div className="moment-noise pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.34),transparent_42%)]" />
        </div>

        <div className="relative z-10 min-h-[100dvh]">
          <main className="mx-auto min-h-[100dvh] w-full pb-28">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20, scale: 0.992, filter: "blur(7px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -14, scale: 0.996, filter: "blur(7px)" }}
                transition={routeSpring}
                className="min-h-[100dvh]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          <BottomNavigation />
        </div>
      </div>
    </MotionConfig>
  );
}

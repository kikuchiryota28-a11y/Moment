"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#F5F2EC] text-neutral-900">
      <div
        className="fixed inset-0 z-0"
        style={{ background: "radial-gradient(circle at 50% 30%, #F5F2EC 0%, #E2DDD3 100%)" }}
        aria-hidden="true"
      >
        <div className="pointer-events-none absolute -left-[18vw] top-[8vh] h-[42vh] w-[42vw] rounded-full bg-white/45 blur-[100px] animate-[moment-aura-left_14s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -right-[16vw] bottom-[4vh] h-[46vh] w-[46vw] rounded-full bg-white/35 blur-[100px] animate-[moment-aura-right_17s_ease-in-out_infinite]" />
      </div>

      <div className="relative z-10 min-h-[100dvh]">
        <main className="mx-auto min-h-[100dvh] w-full px-4 pb-28 sm:px-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[100dvh]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}

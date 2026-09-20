"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { SidebarRail } from "@/components/layout/SidebarRail";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <div className="moment-shell">
      <SidebarRail />
      <div className="md:pl-[248px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNavigation />
    </div>
  );
}

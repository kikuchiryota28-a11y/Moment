"use client";
import {SidebarRail} from "@/components/layout/SidebarRail";
import {BottomNavigation} from "@/components/layout/BottomNavigation";
import {CanvasProvider} from "@/components/layout/CanvasProvider";
export function AppShell({children}:{children:React.ReactNode}){
 return <CanvasProvider><div className="relative min-h-[100dvh] overflow-x-clip bg-[var(--color-canvas)] text-[var(--color-ink)]">
  <div className="relative z-10 min-h-[100dvh]"><SidebarRail/><main className="min-w-0 lg:pl-[76px]"><div className="min-h-[100dvh] pb-24 md:pb-0">{children}</div></main></div>
  <BottomNavigation/>
 </div></CanvasProvider>;
}

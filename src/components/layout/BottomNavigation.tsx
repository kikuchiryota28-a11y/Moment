"use client";

import Link from "next/link";
import { Home, Compass, Plus, UserRound } from "lucide-react";

export function BottomNavigation() {
  return <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#ded8ce] bg-[#f6f2ea]/95 backdrop-blur md:bottom-5 md:left-1/2 md:right-auto md:w-[520px] md:-translate-x-1/2 md:rounded-2xl md:border md:shadow-lg">
    <div className="mx-auto grid h-18 max-w-xl grid-cols-4 items-center px-4">
      <Link href="/" className="flex flex-col items-center gap-1 text-xs font-semibold"><Home size={19}/><span>Home</span></Link>
      <Link href="/journey" className="flex flex-col items-center gap-1 text-xs font-semibold"><Compass size={19}/><span>Journey</span></Link>
      <Link href="/create" aria-label="Create Moment" className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#171614] text-white shadow-md transition-transform hover:scale-105 active:scale-95"><Plus size={25}/></Link>
      <Link href="/profile/me" className="flex flex-col items-center gap-1 text-xs font-semibold"><UserRound size={19}/><span>Profile</span></Link>
    </div>
  </nav>;
}

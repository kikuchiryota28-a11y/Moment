import Link from "next/link";
import { Bell } from "lucide-react";

export function AppHeader() {
  return <header className="flex items-center justify-between py-5">
    <Link href="/" className="text-xl font-black tracking-[-0.04em]">MOMENT<span className="text-[#ef6b35]">.</span></Link>
    <button aria-label="Notifications" className="rounded-full border border-[#ded8ce] bg-white/60 p-2.5"><Bell size={18}/></button>
  </header>;
}

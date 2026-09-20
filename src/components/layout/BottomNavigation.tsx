"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Sparkles,Globe2,Compass,UserRound} from "lucide-react";
const items=[{href:"/",label:"Moment",icon:Sparkles},{href:"/world",label:"World",icon:Globe2},{href:"/journey",label:"Journey",icon:Compass},{href:"/profile/me",label:"You",icon:UserRound}];
export function BottomNavigation(){
 const pathname=usePathname();
 return <nav aria-label="Primary" className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between rounded-[14px] border border-[var(--color-line)] bg-[var(--color-elevated)] px-2 py-1.5 shadow-[var(--shadow-soft)] md:hidden">
  {items.map(({href,label,icon:Icon})=>{const active=href==="/" ? pathname==="/" : pathname.startsWith(href);return <Link key={href} href={href} aria-current={active?"page":undefined} className={cn("flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-[10px] px-2 text-[11px] font-medium transition-colors",active?"bg-[var(--color-ink)] text-white":"text-[var(--color-muted-ink)] hover:text-[var(--color-ink)]")}><Icon size={17} strokeWidth={active?2:1.8}/><span>{label}</span></Link>})}
 </nav>;
}

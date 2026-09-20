import Link from "next/link";
import {ArrowUpRight} from "lucide-react";
import {getTodayMoment,getWorldArchive} from "@/lib/db/v3";
export default async function WorldPage(){
 const[today,archive]=await Promise.all([getTodayMoment(),getWorldArchive()]);
 return <main className="moment-container py-8 pb-28 md:py-10">
  <header className="border-b border-[var(--color-line)] py-8 md:py-12"><p className="moment-eyebrow text-[var(--color-accent)]">World</p><h1 className="mt-3 text-2xl font-semibold tracking-tight">What’s happening</h1></header>
  <section className="py-8"><Link href={"/moment/"+today.id+"/reveal"} className="block border-b border-[var(--color-line)] pb-8"><p className="text-xs text-[var(--color-muted-ink)]">{today.participantCount.toLocaleString()} people</p><h2 className="moment-display mt-3 max-w-3xl text-4xl md:text-6xl">{today.prompt}</h2><div className="mt-5 inline-flex items-center gap-2 text-sm font-medium">View results <ArrowUpRight size={16}/></div></Link></section>
  <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Archive</h2><span className="text-xs text-[var(--color-muted-ink)]">{archive.length}</span></div><div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">{archive.length?archive.map((m:{id:string;moment_date:string;prompt:string})=><Link key={m.id} href={"/moment/"+m.id+"/reveal"} className="flex min-h-20 items-center justify-between gap-5 py-4"><div className="min-w-0"><p className="text-xs text-[var(--color-muted-ink)]">{m.moment_date}</p><p className="mt-1 truncate font-medium">{m.prompt}</p></div><ArrowUpRight size={17} className="shrink-0 text-[var(--color-muted-ink)]"/></Link>):<p className="py-10 text-sm text-[var(--color-muted-ink)]">Nothing yet.</p>}</div></section>
 </main>;
}

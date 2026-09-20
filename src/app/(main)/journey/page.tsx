import Link from "next/link";
import {ArrowUpRight} from "lucide-react";
import {getMyV3Results,getMyV3Journeys} from "@/lib/db/v3-journey";
import {PhaseBadge} from "@/components/ui/Badge";
import {Button} from "@/components/ui/Button";
export default async function JourneyPage(){
 const[results,journeys]=await Promise.all([getMyV3Results(),getMyV3Journeys()]);
 const journeyMap=new Map(journeys.map(j=>[j.daily_moment_id,j]));
 const merged=results.map((r:any)=>({...r,phase:journeyMap.get(r.daily_moment_id)?.phase??"completed"}));
 const journeyOnly=journeys.filter(j=>!results.some((r:any)=>r.daily_moment_id===j.daily_moment_id));
 return <main className="moment-container py-8 pb-28 md:py-10">
  <header className="border-b border-[var(--color-line)] py-8 md:py-12"><p className="moment-eyebrow text-[var(--color-accent)]">Journey</p><h1 className="mt-3 text-2xl font-semibold tracking-tight">Your moments</h1></header>
  <section className="border-b border-[var(--color-line)]">{merged.length||journeyOnly.length?<div className="divide-y divide-[var(--color-line)]">{merged.map((r:any)=><Link key={r.id} href={r.phase==="trying"?"/moment/"+r.daily_moment_id:"/moment/"+r.daily_moment_id+"/reveal"} className="flex min-h-20 items-center justify-between gap-5 py-4"><div className="min-w-0"><div className="flex items-center gap-2"><PhaseBadge phase={r.phase as "planned"|"trying"|"completed"} size="sm"/><span className="text-xs text-[var(--color-muted-ink)]">{r.daily_moments?.moment_date}</span></div><p className="mt-2 truncate font-medium">{r.daily_moments?.prompt}</p></div><ArrowUpRight size={17} className="shrink-0 text-[var(--color-muted-ink)]"/></Link>)}{journeyOnly.map((j:any)=><Link key={j.id} href={"/moment/"+j.daily_moment_id} className="flex min-h-20 items-center justify-between gap-5 py-4"><div><PhaseBadge phase={j.phase as "planned"|"trying"|"completed"} size="sm"/><p className="mt-2 font-medium">{j.daily_moments?.prompt}</p></div><ArrowUpRight size={17}/></Link>)}</div>:<div className="py-16 text-center"><h2 className="text-xl font-semibold">Nothing yet.</h2><Link href="/" className="mt-5 inline-flex"><Button size="md">Open Moment</Button></Link></div>}</section>
 </main>;
}

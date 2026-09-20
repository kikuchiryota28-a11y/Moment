"use client";
import {useEffect} from "react";
import Image from "next/image";
import Link from "next/link";
import {Avatar} from "@/components/shared/Avatar";
import {useCanvas3D} from "@/components/layout/CanvasProvider";
const labels=["One","Two","Three","Four"];
export function RevealPageClient({moment,allResults,myResult,selectedOthers,tomorrowMoment}:{moment:any;allResults:any[];myResult:any;selectedOthers:any[];tomorrowMoment:any}){
 const{setPhase,setMomentData,setIntensity}=useCanvas3D();
 useEffect(()=>{setPhase("branch");setMomentData({id:moment.id,prompt:moment.prompt,participantCount:allResults.length,status:moment.status,myResultId:myResult?.id??null});setIntensity(.15)},[moment,allResults.length,myResult,setPhase,setMomentData,setIntensity]);
 const Result=({r,i,own=false}:{r:any;i:number;own?:boolean})=><article className={"border border-[var(--color-line)] "+(own?"bg-[var(--color-ink)] text-white":"bg-[var(--color-surface)]")+" p-5 md:p-6 rounded-[var(--radius-surface)]"}>
  <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><Avatar src={r.author?.avatarUrl??null} name={r.author?.displayName??"Someone"} size={36}/><div><p className="text-sm font-semibold">{own?"You":r.author?.displayName??"Someone"}</p>{r.countryCode&&<p className={own?"text-white/55":"text-[var(--color-muted-ink)]"}>{r.countryCode}</p>}</div></div><span className={own?"text-white/55":"text-[var(--color-muted-ink)]"}>{own?"You":labels[i]}</span></div>
  {r.mediaUrl&&<div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-[12px]"><Image src={r.mediaUrl} alt="Moment result" fill sizes="(max-width:768px) 100vw, 640px" className="object-cover"/></div>}
  {r.choiceValue&&<p className="mt-5 text-xl font-semibold tracking-tight">{r.choiceValue}</p>}{r.textContent&&<p className="mt-5 whitespace-pre-wrap text-base leading-7">{r.textContent}</p>}{r.why&&<p className={"mt-3 text-sm leading-6 "+(own?"text-white/60":"text-[var(--color-muted-ink)]")}>{r.why}</p>}
 </article>;
 return <main className="moment-container min-h-[100dvh] py-6 pb-24">
  <Link href="/" className="inline-flex text-sm text-[var(--color-muted-ink)] hover:text-[var(--color-ink)]">← Moment</Link>
  <header className="pt-16 md:pt-24 max-w-4xl"><p className="moment-eyebrow text-[var(--color-accent)]">Result</p><h1 className="moment-display mt-4 max-w-[12ch] text-[clamp(3rem,7vw,7rem)]">What happened</h1><p className="mt-4 max-w-2xl text-base text-[var(--color-muted-ink)]">{moment.prompt}</p></header>
  {myResult&&<section className="mt-16 max-w-3xl"><p className="moment-eyebrow text-[var(--color-muted-ink)]">You</p><div className="mt-4"><Result r={myResult} i={0} own/></div></section>}
  <section className="mt-16"><div className="flex items-end justify-between border-b border-[var(--color-line)] pb-3"><p className="moment-eyebrow">World</p><p className="text-sm text-[var(--color-muted-ink)]">{allResults.length.toLocaleString()} results</p></div><div className="mt-4 grid gap-4 md:grid-cols-2">{selectedOthers.map((r,i)=><Result key={r.id} r={r} i={i}/>)}</div>{!selectedOthers.length&&<p className="py-12 text-sm text-[var(--color-muted-ink)]">No results yet.</p>}</section>
  <section className="mt-16 border-t border-[var(--color-line)] pt-6 pb-8"><p className="moment-eyebrow text-[var(--color-accent)]">Next</p>{tomorrowMoment?<Link href={"/moment/"+tomorrowMoment.id} className="mt-4 block max-w-3xl rounded-[var(--radius-surface)] bg-[var(--color-ink)] p-6 text-white md:p-8"><p className="text-xs text-white/55">Tomorrow</p><p className="moment-display mt-3 text-4xl md:text-6xl">{tomorrowMoment.prompt}</p><span className="mt-6 inline-flex min-h-10 items-center rounded-[10px] bg-white px-4 text-sm font-semibold text-[var(--color-ink)]">Enter</span></Link>:<Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded-[12px] bg-[var(--color-ink)] px-5 text-sm font-semibold text-white">Back</Link>}</section>
 </main>;
}

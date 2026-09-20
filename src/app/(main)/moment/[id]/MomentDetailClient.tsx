"use client";
import {useEffect} from "react";
import Link from "next/link";
import {StartMomentButton} from "@/components/v3/StartMomentButton";
import {ResultComposer} from "@/components/v3/ResultComposer";
import {useCanvas3D} from "@/components/layout/CanvasProvider";
type MomentPhase="enter"|"action"|"result"|"branch";
interface MomentData{id:string;prompt:string;participantCount:number;status:string;myResultId:string|null}
export function MomentDetailPageClient({initialMoment,initialResults,initialPhase}:{initialMoment:MomentData;initialResults:unknown[];initialPhase:MomentPhase}){
 const{setPhase,setMomentData,setIntensity}=useCanvas3D();
 useEffect(()=>{setPhase(initialPhase);setMomentData(initialMoment);setIntensity(initialPhase==="enter"||initialPhase==="action"?1:.15)},[initialMoment,initialPhase,setPhase,setMomentData,setIntensity]);
 return <main className="moment-container relative flex min-h-[100dvh] flex-col py-6 pb-24">
  <Link href="/" className="mb-8 inline-flex w-fit text-sm text-[var(--color-muted-ink)] hover:text-[var(--color-ink)]">← Back</Link>
  <div className="flex flex-1 items-center"><section className="w-full max-w-4xl">
   {initialPhase==="enter"&&<><p className="moment-eyebrow text-[var(--color-accent)]">Ready</p><h1 className="moment-display mt-4 max-w-[12ch] text-[clamp(3rem,7vw,7rem)]">{initialMoment.prompt}</h1><div className="mt-8"><StartMomentButton id={initialMoment.id}/></div></>}
   {initialPhase==="action"&&<ResultComposer dailyMomentId={initialMoment.id}/>}
   {initialPhase==="result"&&<Link href={"/moment/"+initialMoment.id+"/reveal"} className="mt-8 inline-flex min-h-11 items-center rounded-[12px] bg-[var(--color-ink)] px-5 text-sm font-semibold text-white hover:opacity-90">View result</Link>}
  </section></div>
 </main>;
}

"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {startTodayMoment} from "@/actions/v3";
import {isSuccess} from "@/lib/action-result";
type MomentData={id:string;prompt:string;participantCount:number;status:string;myResultId:string|null};
type HomeState="empty"|"error";
type MomentState="prepared"|"active"|"closed"|"recorded";
function getState(m:MomentData):MomentState{if(m.myResultId)return "recorded";if(["ENDED","ARCHIVE"].includes(m.status))return "closed";if(["FIRST_MOVER","LIVE","ENDING"].includes(m.status))return "active";return "prepared";}
export function MomentHero({moment,state}:{moment?:MomentData;state?:HomeState}){
 const router=useRouter();const[busy,setBusy]=useState(false);const[error,setError]=useState<string|null>(null);const ms=moment?getState(moment):null;
 const activate=async()=>{if(!moment||busy)return;if(ms==="recorded"||ms==="closed")return router.push("/moment/"+moment.id+"/reveal");if(ms==="active")return router.push("/moment/"+moment.id);setBusy(true);setError(null);try{const result=await startTodayMoment(moment.id);if(isSuccess(result))router.push("/moment/"+moment.id);else setError(result.error??"Could not open this Moment.");}catch{setError("Could not open this Moment.");}finally{setBusy(false);}};
 const title=moment?.prompt??(state==="empty"?"Not yet":"Unavailable");const action=ms==="recorded"?"Revisit":ms==="closed"?"View":ms==="active"?"Enter":"Enter";
 return <main className="moment-container flex min-h-[100dvh] flex-col py-6 pb-24">
  <header className="flex items-center justify-between border-b border-[var(--color-line)] pb-4"><span className="text-sm font-semibold tracking-tight">MOMENT</span><span className="text-xs text-[var(--color-muted-ink)]">Today</span></header>
  <section className="flex flex-1 items-center py-12 md:py-20"><div className="w-full max-w-4xl">
   <p className="moment-eyebrow text-[var(--color-accent)]">Today</p>
   <h1 className="moment-display mt-4 max-w-[12ch] text-[clamp(3rem,7vw,7rem)]">{title}</h1>
   <div className="mt-8 flex flex-wrap items-center gap-4">
    <button onClick={()=>void activate()} disabled={!moment||busy||state==="empty"} className="inline-flex min-h-11 items-center rounded-[12px] bg-[var(--color-ink)] px-5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:pointer-events-none disabled:opacity-40">{busy?"Opening…":action}</button>
    {moment&&<span className="text-xs text-[var(--color-muted-ink)]">{moment.participantCount.toLocaleString()} people</span>}
   </div>
   {error&&<p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">{error}</p>}
  </div></section>
 </main>;
}

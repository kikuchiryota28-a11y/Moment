import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResults } from "@/lib/db/v3";
import { ResultSafetyMenu } from "@/components/v3/ResultSafetyMenu";

const labels=["SIMILAR","SHIFT","DIFFERENT","UNEXPECTED","WORLD"];
export default async function RevealPage({params}:{params:Promise<{id:string}>}){
 const{id}=await params;const sb=await createClient();const{data:{user}}=await sb.auth.getUser();
 const{data:moment}=await sb.from("daily_moments").select("id,prompt,status").eq("id",id).maybeSingle();if(!moment)notFound();
 const results=await getResults(id,user?.id);
 return <main className="py-6 sm:py-10"><Link href="/" className="text-sm font-bold">← MOMENT</Link><p className="mt-8 text-xs font-black uppercase tracking-[.2em] text-[#ef6b35]">WORLD REVEAL</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em] sm:text-6xl">Same question.<br/>Different reality.</h1><p className="mt-4 max-w-xl text-[#777269]">{moment.prompt}</p>
 <div className="mt-10 space-y-5">{results.length?results.map((r,i)=><article key={r.id} className="overflow-hidden rounded-[28px] border border-[#ded8ce] bg-white/70"><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[.16em] text-[#777269]">{labels[i]}</p><p className="mt-2 text-sm font-bold">{r.author?.displayName??"Someone"}{r.countryCode?` · ${r.countryCode}`:""}</p></div><ResultSafetyMenu resultId={r.id} userId={r.userId}/></div>{r.mediaUrl&&<div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl"><Image src={r.mediaUrl} alt="A Moment result" fill sizes="(max-width:768px) 100vw, 768px" className="object-cover"/></div>}{r.choiceValue&&<p className="mt-4 text-2xl font-black">{r.choiceValue}</p>}{r.textContent&&<p className="mt-4 whitespace-pre-wrap text-base leading-7">{r.textContent}</p>}{r.why&&<p className="mt-3 text-sm leading-6 text-[#777269]">{r.why}</p>}</div></article>):<div className="rounded-[28px] border border-dashed border-[#cfc7bb] p-8"><p className="font-black">The world is still forming.</p><p className="mt-2 text-sm text-[#777269]">Come back after more people have answered.</p></div>}</div>
 <div className="mt-10 rounded-[28px] bg-[#171614] p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-white/60">TODAY</p><p className="mt-2 text-2xl font-black">SAME QUESTION. DIFFERENT REALITY.</p><p className="mt-2 text-sm text-white/65">THAT&apos;S TODAY&apos;S MOMENT. TOMORROW IS UNKNOWN.</p></div></main>;
}

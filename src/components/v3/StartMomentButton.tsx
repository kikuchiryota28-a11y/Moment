"use client";
import { useState } from "react";
import { startTodayMoment } from "@/actions/v3";
export function StartMomentButton({id}:{id:string}){const[busy,setBusy]=useState(false);const[done,setDone]=useState(false);async function go(){setBusy(true);const r=await startTodayMoment(id);setDone(r.success);setBusy(false)}return <button onClick={()=>void go()} disabled={busy||done} className="w-full rounded-2xl bg-[#171614] px-5 py-4 text-sm font-black text-white disabled:opacity-50">{done?"WORLD IS FORMING.":busy?"STARTING…":"GO"}</button>}

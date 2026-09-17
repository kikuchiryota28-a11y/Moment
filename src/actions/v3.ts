"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action";
import type { ResultType } from "@/types/v3";

function uuid(v:string){return /^[0-9a-f-]{36}$/i.test(v)}

export async function startTodayMoment(id:string):Promise<ActionResult<{started:boolean}>>{
  if(!uuid(id)) return {success:false,error:"Invalid Moment.",code:"INVALID_MOMENT_ID"};
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return {success:false,error:"Authentication required.",code:"AUTH_REQUIRED"};
  const now=new Date().toISOString();
  const {error}=await supabase.from("daily_moments").update({status:"LIVE",first_mover_id:user.id,started_at:now}).eq("id",id).eq("status","PREPARED").is("first_mover_id",null);
  if(error) return {success:false,error:"Moment could not be started.",code:"START_FAILED"};
  revalidatePath("/"); revalidatePath(`/moment/${id}`); return {success:true,data:{started:true}};
}

export async function submitTodayResult(formData:FormData):Promise<ActionResult<{id:string}>>{
  const dailyMomentId=String(formData.get("dailyMomentId")??"");
  const resultType=String(formData.get("resultType")??"") as ResultType;
  const textContent=String(formData.get("textContent")??"").trim();
  const choiceValue=String(formData.get("choiceValue")??"").trim();
  const why=String(formData.get("why")??"").trim();
  const countryCode=String(formData.get("countryCode")??"").trim().toUpperCase();
  const city=String(formData.get("city")??"").trim();
  if(!uuid(dailyMomentId)) return {success:false,error:"Invalid Moment.",code:"INVALID_MOMENT_ID"};
  if(!["photo","video","text","choice","combination"].includes(resultType)) return {success:false,error:"Invalid result type.",code:"INVALID_RESULT_TYPE"};
  if(resultType==="text" && (!textContent || textContent.length>2000)) return {success:false,error:"Text must be 1–2000 characters.",code:"INVALID_TEXT"};
  if(resultType==="choice" && (!choiceValue || choiceValue.length>120)) return {success:false,error:"Choose an answer.",code:"INVALID_CHOICE"};
  if(why.length>500 || city.length>120) return {success:false,error:"Answer is too long.",code:"INVALID_RESULT"};
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return {success:false,error:"Authentication required.",code:"AUTH_REQUIRED"};
  const {data:moment}=await supabase.from("daily_moments").select("id,status").eq("id",dailyMomentId).maybeSingle();
  if(!moment || !["FIRST_MOVER","LIVE","ENDING"].includes(moment.status)) return {success:false,error:"This Moment is not accepting answers.",code:"MOMENT_NOT_LIVE"};
  const {data,error}=await supabase.from("results").upsert({daily_moment_id:dailyMomentId,user_id:user.id,result_type:textContent&&resultType==="text"?"text":resultType,text_content:textContent||null,choice_value:choiceValue||null,why:why||null,country_code:countryCode||null,city:city||null},{onConflict:"daily_moment_id,user_id"}).select("id").single();
  if(error || !data) return {success:false,error:"Your Moment could not be saved.",code:"RESULT_SAVE_FAILED"};
  revalidatePath("/"); revalidatePath(`/moment/${dailyMomentId}`); revalidatePath("/journey"); return {success:true,data:{id:data.id}};
}

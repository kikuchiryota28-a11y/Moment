import { createClient } from "@/lib/supabase/server";
import type { DailyMoment, Result } from "@/types/v3";

type DailyRow={id:string;moment_date:string;prompt:string;status:DailyMoment["status"];first_mover_id:string|null;started_at:string|null;ends_at:string};
type ResultRow={id:string;daily_moment_id:string;user_id:string;result_type:Result["resultType"];text_content:string|null;choice_value:string|null;why:string|null;country_code:string|null;city:string|null;created_at:string;profiles:{username:string;display_name:string;avatar_url:string|null}|null;result_media:{media_url:string}[]|null};

export async function getTodayMoment():Promise<DailyMoment>{
 const sb=await createClient();
 const{data:{user}}=await sb.auth.getUser();
 let row:DailyRow|null=null;
 const{data:rpcRow,error:rpcError}=await sb.rpc("ensure_today_moment");
 if(!rpcError&&rpcRow) row=rpcRow as unknown as DailyRow;
 if(!row){
  const{data:directRow}=await sb.from("daily_moments").select("id,moment_date,prompt,status,first_mover_id,started_at,ends_at").eq("moment_date",new Date().toISOString().slice(0,10)).maybeSingle();
  row=directRow as DailyRow|null;
 }
 if(!row)throw new Error("Today's Moment is not available yet.");
 const d=row;const now=Date.now();const ends=new Date(d.ends_at).getTime();const status=d.status==="LIVE"&&ends<=now?"ENDED":d.status==="LIVE"&&ends-now<3*60*60*1000?"ENDING":d.status;
 const[{count},my]=await Promise.all([sb.from("results").select("id",{count:"exact",head:true}).eq("daily_moment_id",d.id).eq("moderation_status","VISIBLE"),user?sb.from("results").select("id").eq("daily_moment_id",d.id).eq("user_id",user.id).maybeSingle():Promise.resolve({data:null})]);
 return{id:d.id,momentDate:d.moment_date,prompt:d.prompt,status:status as DailyMoment["status"],firstMoverId:d.first_mover_id,startedAt:d.started_at,endsAt:d.ends_at,participantCount:count??0,myResultId:my.data?.id??null};
}

export async function getResults(dailyMomentId:string,userId?:string):Promise<Result[]>{const sb=await createClient();const{data,error}=await sb.from("results").select("id,daily_moment_id,user_id,result_type,text_content,choice_value,why,country_code,city,created_at,profiles!results_user_id_fkey(username,display_name,avatar_url),result_media(media_url)").eq("daily_moment_id",dailyMomentId).eq("moderation_status","VISIBLE").order("created_at",{ascending:true}).limit(100);if(error)throw error;const rows=(data??[]) as unknown as ResultRow[];return selectReveal(rows.filter(r=>r.user_id!==userId)).map(mapResult);}

export async function getWorldArchive(limit=24){const sb=await createClient();const{data,error}=await sb.from("daily_moments").select("id,moment_date,prompt,status").lt("moment_date",new Date().toISOString().slice(0,10)).order("moment_date",{ascending:false}).limit(limit);if(error)throw error;return data??[];}

export async function getTomorrowMoment(): Promise<{ id: string; momentDate: string; prompt: string; status: string } | null> {
  const sb = await createClient();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  const { data, error } = await sb
    .from("daily_moments")
    .select("id, moment_date, prompt, status")
    .eq("moment_date", tomorrowStr)
    .maybeSingle();
  if (error || !data) return null;
  return { id: data.id, momentDate: data.moment_date, prompt: data.prompt, status: data.status };
}

export async function getResultById(id:string):Promise<Result|null>{const sb=await createClient();const{data,error}=await sb.from("results").select("id,daily_moment_id,user_id,result_type,text_content,choice_value,why,country_code,city,created_at,profiles!results_user_id_fkey(username,display_name,avatar_url),result_media(media_url)").eq("id",id).eq("moderation_status","VISIBLE").maybeSingle();if(error)throw error;return data?mapResult(data as unknown as ResultRow):null;}

function selectReveal(rows:ResultRow[]){const picked:ResultRow[]=[];const usedTypes=new Set<string>();const usedCountries=new Set<string>();const take=(p:(r:ResultRow)=>boolean)=>{const i=rows.findIndex(r=>!picked.includes(r)&&p(r));if(i>=0){const row=rows[i];picked.push(row);usedTypes.add(row.result_type);const country=row.country_code??"";if(country.length>0)usedCountries.add(country);}};
take(r=>r.result_type==="choice");take(r=>!usedTypes.has(r.result_type));take(r=>{const country=r.country_code;return typeof country==="string"&&country.length>0&&!usedCountries.has(country);});take(r=>r.result_type==="photo"||r.result_type==="video");take(r=>r.result_type==="text"||r.result_type==="combination");
for(const r of rows){if(picked.length>=5)break;if(!picked.includes(r))picked.push(r)}return picked.slice(0,5);}
function mapResult(r:ResultRow):Result{return{id:r.id,dailyMomentId:r.daily_moment_id,userId:r.user_id,resultType:r.result_type,textContent:r.text_content,choiceValue:r.choice_value,why:r.why,countryCode:r.country_code,city:r.city,mediaUrl:r.result_media?.[0]?.media_url??null,createdAt:r.created_at,author:r.profiles?{username:r.profiles.username,displayName:r.profiles.display_name,avatarUrl:r.profiles.avatar_url}:null};}

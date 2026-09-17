import { createClient } from "@/lib/supabase/server";
import type { DailyMoment, Result } from "@/types/v3";

const DAILY_COLUMNS = "id,moment_date,prompt,status,first_mover_id,started_at,ends_at";
const RESULT_COLUMNS = "id,daily_moment_id,user_id,result_type,text_content,choice_value,why,country_code,city,created_at";

type DailyRow = { id:string; moment_date:string; prompt:string; status:DailyMoment["status"]; first_mover_id:string|null; started_at:string|null; ends_at:string };
type ResultRow = { id:string; daily_moment_id:string; user_id:string; result_type:Result["resultType"]; text_content:string|null; choice_value:string|null; why:string|null; country_code:string|null; city:string|null; created_at:string; profiles:{username:string;display_name:string;avatar_url:string|null}|null; result_media:{media_url:string}[]|null };

export async function getTodayMoment(): Promise<DailyMoment> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { data: row, error } = await supabase.from("daily_moments").select(DAILY_COLUMNS).eq("moment_date", new Date().toISOString().slice(0,10)).maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("Today's Moment is not prepared yet.");
  const d = row as unknown as DailyRow;
  const [{ count }, my] = await Promise.all([
    supabase.from("results").select("id", { count:"exact", head:true }).eq("daily_moment_id", d.id),
    user.user ? supabase.from("results").select("id").eq("daily_moment_id", d.id).eq("user_id", user.user.id).maybeSingle() : Promise.resolve({data:null})
  ]);
  return { id:d.id, momentDate:d.moment_date, prompt:d.prompt, status:d.status, firstMoverId:d.first_mover_id, startedAt:d.started_at, endsAt:d.ends_at, participantCount:count ?? 0, myResultId:my.data?.id ?? null };
}

export async function getResults(dailyMomentId:string, userId?:string): Promise<Result[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("results").select(`${RESULT_COLUMNS},profiles!results_user_id_fkey(username,display_name,avatar_url),result_media(media_url)`).eq("daily_moment_id", dailyMomentId).order("created_at", {ascending:true}).limit(60);
  if (error) throw error;
  const rows = (data ?? []) as unknown as ResultRow[];
  const others = rows.filter(r => r.user_id !== userId);
  if (!userId) return others.map(mapResult);
  return selectReveal(others).map(mapResult);
}

function selectReveal(rows: ResultRow[]) {
  const picked: ResultRow[] = [];
  const take = (predicate:(r:ResultRow)=>boolean) => { const i = rows.findIndex(r => !picked.includes(r) && predicate(r)); if(i>=0) picked.push(rows[i]); };
  take(r => r.result_type === "choice");
  take(r => r.result_type !== picked[0]?.result_type);
  take(r => Boolean(r.country_code) && r.country_code !== picked[0]?.country_code);
  take(r => r.result_type === "text" || r.result_type === "combination");
  for (const r of rows) { if(picked.length>=5) break; if(!picked.includes(r)) picked.push(r); }
  return picked.slice(0,5);
}

function mapResult(r:ResultRow):Result { return { id:r.id,dailyMomentId:r.daily_moment_id,userId:r.user_id,resultType:r.result_type,textContent:r.text_content,choiceValue:r.choice_value,why:r.why,countryCode:r.country_code,city:r.city,mediaUrl:r.result_media?.[0]?.media_url ?? null,createdAt:r.created_at,author:r.profiles ? {username:r.profiles.username,displayName:r.profiles.display_name,avatarUrl:r.profiles.avatar_url}:null }; }

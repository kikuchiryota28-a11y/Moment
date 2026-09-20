import { createClient } from "@/lib/supabase/server";

export async function getMyV3Results() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data, error } = await sb
    .from("results")
    .select("id, daily_moment_id, result_type, text_content, choice_value, why, created_at, daily_moments(prompt, moment_date), result_media(media_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getMyV3Journeys() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];
  const { data, error } = await sb
    .from("journeys")
    .select("id, daily_moment_id, status, phase, planned_at, started_at, completed_at, experience_note, experience_media_url, experience_location_name, experience_recorded_at, daily_moments(prompt, moment_date, status)")
    .eq("user_id", user.id)
    .not("daily_moment_id", "is", null)
    .order("planned_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}
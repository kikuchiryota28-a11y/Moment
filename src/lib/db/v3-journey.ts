import { createClient } from "@/lib/supabase/server";

export type V3Result = {
  id: string;
  daily_moment_id: string;
  user_id: string;
  result_type: "photo" | "video" | "text" | "choice" | "combination";
  text_content: string | null;
  choice_value: string | null;
  why: string | null;
  country_code: string | null;
  city: string | null;
  created_at: string;
  daily_moments: {
    id: string;
    moment_date: string;
    prompt: string;
  } | null;
};

export type V3Journey = {
  id: string;
  user_id: string;
  daily_moment_id: string | null;
  phase: "PLANNED" | "TRYING" | "COMPLETED";
  experience_note: string | null;
  experience_media_url: string | null;
  experience_location_name: string | null;
  created_at: string;
  daily_moments: {
    id: string;
    moment_date: string;
    prompt: string;
  } | null;
};

export async function getMyV3Results(): Promise<V3Result[]> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from("results")
    .select(`
      id,
      daily_moment_id,
      user_id,
      result_type,
      text_content,
      choice_value,
      why,
      country_code,
      city,
      created_at,
      daily_moments!inner(id, moment_date, prompt)
    `)
    .eq("user_id", user.id)
    .eq("moderation_status", "VISIBLE")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as V3Result[];
}

export async function getMyV3Journeys(): Promise<V3Journey[]> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from("journeys")
    .select(`
      id,
      user_id,
      daily_moment_id,
      phase,
      experience_note,
      experience_media_url,
      experience_location_name,
      created_at,
      daily_moments!left(id, moment_date, prompt)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as V3Journey[];
}
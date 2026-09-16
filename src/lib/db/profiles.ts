import { createClient } from "@/lib/supabase/server";
import type { Journey, Moment, Profile, UserStats } from "@/types/moment";
import type { ProfileRow } from "@/types/database";

type MomentRow = {
  id: string; user_id: string; title: string; description: string; why: string | null; category: string;
  location_name: string | null; latitude: number | null; longitude: number | null; duration_minutes: number | null;
  estimated_cost: number | null; experience_note: string | null; rating: number; would_do_again: boolean; created_at: string; updated_at: string;
};
type ExperienceRow = { id: string; user_id: string; moment_id: string | null; moment_title_snapshot: string | null; status: "COMPLETED"; completed_at: string | null; experience_recorded_at: string | null; experience_note: string | null; experience_media_url: string | null; experience_location_name: string | null; };
type ExperienceStatsRow = { experience_count: number | string | null; place_count: number | string | null };
const PROFILE_COLUMNS = "id,username,display_name,avatar_url,bio,website_url,instagram_url,x_url,created_at,updated_at";
const MOMENT_COLUMNS = "id,user_id,title,description,why,category,location_name,latitude,longitude,duration_minutes,estimated_cost,experience_note,rating,would_do_again,created_at,updated_at";

function mapProfile(p: ProfileRow): Profile & { websiteUrl: string | null; instagramUrl: string | null; xUrl: string | null } {
  return { id: p.id, username: p.username, displayName: p.display_name, avatarUrl: p.avatar_url, bio: p.bio, websiteUrl: p.website_url, instagramUrl: p.instagram_url, xUrl: p.x_url, createdAt: p.created_at, updatedAt: p.updated_at };
}
function mapMoment(m: MomentRow): Moment {
  return { id: m.id, userId: m.user_id, title: m.title, description: m.description, why: m.why, category: m.category as Moment["category"], locationName: m.location_name, latitude: m.latitude, longitude: m.longitude, durationMinutes: m.duration_minutes, estimatedCost: m.estimated_cost, experienceNote: m.experience_note, rating: m.rating, wouldDoAgain: m.would_do_again, createdAt: m.created_at, updatedAt: m.updated_at };
}
function mapExperience(e: ExperienceRow): Journey {
  return { id: e.id, userId: e.user_id, momentId: e.moment_id, status: "COMPLETED", plannedAt: null, startedAt: null, completedAt: e.completed_at, experienceRecordedAt: e.experience_recorded_at, experienceNote: e.experience_note, experienceMediaUrl: e.experience_media_url, experienceLocationName: e.experience_location_name, createdAt: e.completed_at ?? e.experience_recorded_at ?? new Date(0).toISOString(), updatedAt: e.experience_recorded_at ?? e.completed_at ?? new Date(0).toISOString(), momentTitle: e.moment_title_snapshot };
}

export async function getProfile(username: string) {
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("username", username.trim().toLowerCase()).maybeSingle();
  if (profileError || !profile) return null;

  const [momentsResult, statsResult, experiencesResult] = await Promise.all([
    supabase.from("moments").select(MOMENT_COLUMNS).eq("user_id", profile.id).order("created_at", { ascending: false }),
    supabase.rpc("get_user_experience_stats", { target_user_id: profile.id }).maybeSingle(),
    supabase.from("journeys").select("id,user_id,moment_id,moment_title_snapshot,status,completed_at,experience_recorded_at,experience_note,experience_media_url,experience_location_name").eq("user_id", profile.id).eq("status", "COMPLETED").order("completed_at", { ascending: false }).limit(12),
  ]);
  if (momentsResult.error) { console.error("getProfile moments query failed", momentsResult.error); return null; }
  if (statsResult.error) console.error("getProfile experience stats failed", statsResult.error);
  if (experiencesResult.error) console.error("getProfile experiences query failed", experiencesResult.error);

  const rows = (momentsResult.data ?? []) as unknown as MomentRow[];
  const statsRow = (statsResult.data ?? null) as ExperienceStatsRow | null;
  const stats: UserStats = { momentCount: rows.length, experienceCount: Number(statsRow?.experience_count ?? 0), placeCount: Number(statsRow?.place_count ?? 0) };
  const experiences = ((experiencesResult.data ?? []) as unknown as ExperienceRow[]).map(mapExperience);
  return { profile: mapProfile(profile as unknown as ProfileRow), moments: rows.map(mapMoment), experiences, stats };
}

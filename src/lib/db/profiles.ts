import { createClient } from "@/lib/supabase/server";
import type { Moment, Profile, UserStats } from "@/types/moment";
import type { ProfileRow } from "@/types/database";

type MomentRow = {
  id: string; user_id: string; title: string; description: string; why: string | null; category: string;
  location_name: string | null; latitude: number | null; longitude: number | null; duration_minutes: number | null;
  estimated_cost: number | null; experience_note: string | null; rating: number; would_do_again: boolean; created_at: string; updated_at: string;
};

const PROFILE_COLUMNS = "id,username,display_name,avatar_url,bio,website_url,instagram_url,x_url,created_at,updated_at";
const MOMENT_COLUMNS = "id,user_id,title,description,why,category,location_name,latitude,longitude,duration_minutes,estimated_cost,experience_note,rating,would_do_again,created_at,updated_at";

function mapProfile(p: ProfileRow): Profile & { websiteUrl: string | null; instagramUrl: string | null; xUrl: string | null } {
  return { id: p.id, username: p.username, displayName: p.display_name, avatarUrl: p.avatar_url, bio: p.bio, websiteUrl: p.website_url, instagramUrl: p.instagram_url, xUrl: p.x_url, createdAt: p.created_at, updatedAt: p.updated_at };
}
function mapMoment(m: MomentRow): Moment {
  return { id: m.id, userId: m.user_id, title: m.title, description: m.description, why: m.why, category: m.category as Moment["category"], locationName: m.location_name, latitude: m.latitude, longitude: m.longitude, durationMinutes: m.duration_minutes, estimatedCost: m.estimated_cost, experienceNote: m.experience_note, rating: m.rating, wouldDoAgain: m.would_do_again, createdAt: m.created_at, updatedAt: m.updated_at };
}

export async function getProfile(username: string) {
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("username", username.trim().toLowerCase()).maybeSingle();
  if (profileError) { console.error("getProfile profile query failed", profileError); return null; }
  if (!profile) return null;

  const [momentsResult, experiencesResult] = await Promise.all([
    supabase.from("moments").select(MOMENT_COLUMNS).eq("user_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("journeys").select("id", { count: "exact", head: true }).eq("user_id", profile.id).eq("status", "COMPLETED"),
  ]);
  if (momentsResult.error) { console.error("getProfile moments query failed", momentsResult.error); return null; }
  if (experiencesResult.error) console.error("getProfile experience count failed", experiencesResult.error);

  const rows = (momentsResult.data ?? []) as unknown as MomentRow[];
  const places = new Set(rows.map((m) => m.location_name).filter((value): value is string => Boolean(value))).size;
  const stats: UserStats = { momentCount: rows.length, experienceCount: experiencesResult.count ?? 0, placeCount: places };
  return { profile: mapProfile(profile as unknown as ProfileRow), moments: rows.map(mapMoment), stats };
}

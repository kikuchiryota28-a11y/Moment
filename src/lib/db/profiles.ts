import { createClient } from "@/lib/supabase/server";
import type { Moment, Profile, UserStats } from "@/types/moment";

const mapProfile = (p: any): Profile => ({ id: p.id, username: p.username, displayName: p.display_name, avatarUrl: p.avatar_url, bio: p.bio, createdAt: p.created_at, updatedAt: p.updated_at });
const mapMoment = (m: any): Moment => ({ id: m.id, userId: m.user_id, title: m.title, description: m.description, why: m.why, category: m.category, locationName: m.location_name, latitude: m.latitude, longitude: m.longitude, durationMinutes: m.duration_minutes, estimatedCost: m.estimated_cost, rating: m.rating, wouldDoAgain: m.would_do_again, createdAt: m.created_at, updatedAt: m.updated_at });

export async function getProfile(username: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  if (!profile) return null;
  const { data: moments } = await supabase.from("moments").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });
  const rows = moments ?? [];
  const places = new Set(rows.map((m: any) => m.location_name).filter(Boolean)).size;
  const { count: experiences } = await supabase.from("journeys").select("id", { count: "exact", head: true }).eq("user_id", profile.id).eq("status", "COMPLETED");
  return { profile: mapProfile(profile), moments: rows.map(mapMoment), stats: { momentCount: rows.length, experienceCount: experiences ?? 0, placeCount: places } satisfies UserStats };
}

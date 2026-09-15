import { createClient } from "@/lib/supabase/server";
import type { Comment, Moment, MomentDetail, MomentMedia, Profile } from "@/types/moment";

const mapProfile = (p: any): Profile => ({ id: p.id, username: p.username, displayName: p.display_name, avatarUrl: p.avatar_url, bio: p.bio, createdAt: p.created_at, updatedAt: p.updated_at });
const mapMoment = (m: any): Moment => ({ id: m.id, userId: m.user_id, title: m.title, description: m.description, why: m.why, category: m.category, locationName: m.location_name, latitude: m.latitude, longitude: m.longitude, durationMinutes: m.duration_minutes, estimatedCost: m.estimated_cost, rating: m.rating, wouldDoAgain: m.would_do_again, createdAt: m.created_at, updatedAt: m.updated_at });
const mapMedia = (m: any): MomentMedia => ({ id: m.id, momentId: m.moment_id, mediaUrl: m.media_url, mediaType: m.media_type, sortOrder: m.sort_order });

export async function getMoments(category?: string) {
  const supabase = await createClient();
  let query = supabase.from("moments").select("*, profiles!moments_user_id_fkey(*)").order("created_at", { ascending: false }).limit(30);
  if (category && category !== "all") query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  const ids = (data ?? []).map((m: any) => m.id);
  const { data: media } = ids.length ? await supabase.from("moment_media").select("*").in("moment_id", ids).order("sort_order") : { data: [] };
  const mediaMap = new Map<string, any>();
  (media ?? []).forEach((item: any) => { if (!mediaMap.has(item.moment_id)) mediaMap.set(item.moment_id, item); });
  return (data ?? []).map((m: any) => ({ moment: mapMoment(m), author: mapProfile(m.profiles), mediaUrl: mediaMap.get(m.id)?.media_url ?? null }));
}

export async function getMomentDetail(id: string): Promise<MomentDetail | null> {
  const supabase = await createClient();
  const { data: m, error } = await supabase.from("moments").select("*, profiles!moments_user_id_fkey(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!m) return null;
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: media }, { count: likeCount }, { count: commentCount }, { data: comments }, { data: journey }] = await Promise.all([
    supabase.from("moment_media").select("*").eq("moment_id", id).order("sort_order"),
    supabase.from("likes").select("user_id", { count: "exact", head: true }).eq("moment_id", id),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("moment_id", id),
    supabase.from("comments").select("*, profiles!comments_user_id_fkey(*)").eq("moment_id", id).order("created_at", { ascending: false }).limit(50),
    user ? supabase.from("journeys").select("status").eq("moment_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const { data: like } = user ? await supabase.from("likes").select("user_id").eq("moment_id", id).eq("user_id", user.id).maybeSingle() : { data: null };
  const { data: follow } = user && user.id !== m.user_id ? await supabase.from("follows").select("follower_id").eq("follower_id", user.id).eq("following_id", m.user_id).maybeSingle() : { data: null };
  return { moment: mapMoment(m), author: mapProfile(m.profiles), media: (media ?? []).map(mapMedia), social: { likeCount: likeCount ?? 0, commentCount: commentCount ?? 0, isLiked: Boolean(like), isFollowingAuthor: Boolean(follow) }, journey: { status: journey?.status ?? null }, comments: (comments ?? []).map((c: any): Comment => ({ id: c.id, userId: c.user_id, momentId: c.moment_id, body: c.body, createdAt: c.created_at, updatedAt: c.updated_at, author: c.profiles ? mapProfile(c.profiles) : undefined })) };
}

import { createClient } from "@/lib/supabase/server";
import type { Comment, JourneyStatus, Moment, MomentDetail, MomentMedia, Profile } from "@/types/moment";
import type { ProfileRow } from "@/types/database";

type MomentRow = { id: string; user_id: string; title: string; description: string; why: string | null; category: string; location_name: string | null; latitude: number | null; longitude: number | null; duration_minutes: number | null; estimated_cost: number | null; experience_note: string | null; rating: number; would_do_again: boolean; created_at: string; updated_at: string };
type MediaRow = { id: string; moment_id: string; media_url: string; media_type: "image" | "video"; sort_order: number };
type CommentRow = { id: string; user_id: string; moment_id: string; body: string; created_at: string; updated_at: string; profiles: ProfileRow | null };
type MomentWithProfile = MomentRow & { profiles: ProfileRow };

const MOMENT_COLUMNS = "id,user_id,title,description,why,category,location_name,latitude,longitude,duration_minutes,estimated_cost,experience_note,rating,would_do_again,created_at,updated_at";
const PROFILE_COLUMNS = "id,username,display_name,avatar_url,bio,website_url,instagram_url,x_url,created_at,updated_at";
const mapProfile = (p: ProfileRow): Profile => ({ id: p.id, username: p.username, displayName: p.display_name, avatarUrl: p.avatar_url, bio: p.bio, websiteUrl: p.website_url, instagramUrl: p.instagram_url, xUrl: p.x_url, createdAt: p.created_at, updatedAt: p.updated_at });
const mapMoment = (m: MomentRow): Moment => ({ id: m.id, userId: m.user_id, title: m.title, description: m.description, why: m.why, category: m.category as Moment["category"], locationName: m.location_name, latitude: m.latitude, longitude: m.longitude, durationMinutes: m.duration_minutes, estimatedCost: m.estimated_cost, experienceNote: m.experience_note, rating: m.rating, wouldDoAgain: m.would_do_again, createdAt: m.created_at, updatedAt: m.updated_at });
const mapMedia = (m: MediaRow): MomentMedia => ({ id: m.id, momentId: m.moment_id, mediaUrl: m.media_url, mediaType: m.media_type, sortOrder: m.sort_order });

export async function getMoments(category?: string) {
  const supabase = await createClient();
  const [{ data: { user } }, momentResult] = await Promise.all([
    supabase.auth.getUser(),
    (async () => {
      let query = supabase.from("moments").select(`${MOMENT_COLUMNS}, profiles!moments_user_id_fkey(${PROFILE_COLUMNS})`).order("created_at", { ascending: false }).limit(30);
      if (category && category !== "all") query = query.eq("category", category);
      return query;
    })(),
  ]);
  if (momentResult.error) throw momentResult.error;
  const rows = (momentResult.data ?? []) as unknown as MomentWithProfile[];
  const ids = rows.map((m) => m.id);
  const [mediaResult, journeyResult] = await Promise.all([
    ids.length ? supabase.from("moment_media").select("id,moment_id,media_url,media_type,sort_order").in("moment_id", ids).order("sort_order") : Promise.resolve({ data: [], error: null }),
    user && ids.length ? supabase.from("journeys").select("moment_id,status").eq("user_id", user.id).in("moment_id", ids) : Promise.resolve({ data: [], error: null }),
  ]);
  if (mediaResult.error) throw mediaResult.error;
  if (journeyResult.error) throw journeyResult.error;
  const mediaMap = new Map<string, MediaRow>();
  for (const item of (mediaResult.data ?? []) as unknown as MediaRow[]) if (!mediaMap.has(item.moment_id)) mediaMap.set(item.moment_id, item);
  const journeyMap = new Map<string, JourneyStatus>();
  for (const item of (journeyResult.data ?? []) as Array<{ moment_id: string; status: JourneyStatus }>) journeyMap.set(item.moment_id, item.status);
  return rows.filter((m) => !user || m.user_id !== user.id).map((m) => ({ moment: mapMoment(m), author: mapProfile(m.profiles), mediaUrl: mediaMap.get(m.id)?.media_url ?? null, journeyStatus: journeyMap.get(m.id) ?? null }));
}

export async function getMomentEditor(id: string): Promise<{ moment: Moment; media: MomentMedia[] } | null> {
  const supabase = await createClient();
  const [{ data: { user }, error: authError }, { data: row, error: momentError }] = await Promise.all([supabase.auth.getUser(), supabase.from("moments").select(MOMENT_COLUMNS).eq("id", id).maybeSingle()]);
  if (authError || !user || momentError || !row) return null;
  const moment = row as unknown as MomentRow;
  if (moment.user_id !== user.id) return null;
  const { data: media, error: mediaError } = await supabase.from("moment_media").select("id,moment_id,media_url,media_type,sort_order").eq("moment_id", id).order("sort_order");
  if (mediaError) return null;
  return { moment: mapMoment(moment), media: ((media ?? []) as unknown as MediaRow[]).map(mapMedia) };
}

export async function getMomentDetail(id: string): Promise<MomentDetail | null> {
  const supabase = await createClient();
  const [momentResult, authResult] = await Promise.all([supabase.from("moments").select(`${MOMENT_COLUMNS}, profiles!moments_user_id_fkey(${PROFILE_COLUMNS})`).eq("id", id).maybeSingle(), supabase.auth.getUser()]);
  if (momentResult.error) throw momentResult.error;
  if (!momentResult.data) return null;
  const m = momentResult.data as unknown as MomentWithProfile;
  const user = authResult.data.user;
  const [mediaResult, likeCountResult, commentCountResult, commentsResult, journeyResult, likeResult, followResult] = await Promise.all([
    supabase.from("moment_media").select("id,moment_id,media_url,media_type,sort_order").eq("moment_id", id).order("sort_order"),
    supabase.from("likes").select("user_id", { count: "exact", head: true }).eq("moment_id", id),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("moment_id", id),
    supabase.from("comments").select(`id,user_id,moment_id,body,created_at,updated_at,profiles!comments_user_id_fkey(${PROFILE_COLUMNS})`).eq("moment_id", id).order("created_at", { ascending: false }).limit(50),
    user ? supabase.from("journeys").select("status").eq("moment_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    user ? supabase.from("likes").select("user_id").eq("moment_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    user && user.id !== m.user_id ? supabase.from("follows").select("follower_id").eq("follower_id", user.id).eq("following_id", m.user_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  if (mediaResult.error) throw mediaResult.error;
  if (commentsResult.error) throw commentsResult.error;
  if (journeyResult.error) throw journeyResult.error;
  if (likeResult.error) throw likeResult.error;
  if (followResult.error) throw followResult.error;
  const comments = (commentsResult.data ?? []) as unknown as CommentRow[];
  return { moment: mapMoment(m), author: mapProfile(m.profiles), isOwner: user?.id === m.user_id, media: ((mediaResult.data ?? []) as unknown as MediaRow[]).map(mapMedia), social: { likeCount: likeCountResult.count ?? 0, commentCount: commentCountResult.count ?? 0, isLiked: Boolean(likeResult.data), isFollowingAuthor: Boolean(followResult.data) }, journey: { status: (journeyResult.data?.status as MomentDetail["journey"]["status"]) ?? null }, comments: comments.map((c): Comment => ({ id: c.id, userId: c.user_id, momentId: c.moment_id, body: c.body, createdAt: c.created_at, updatedAt: c.updated_at, author: c.profiles ? mapProfile(c.profiles) : undefined })) };
}

import { createClient } from "@/lib/supabase/server";
import type { Journey, Moment } from "@/types/moment";

const mapMoment = (m: any): Moment => ({ id: m.id, userId: m.user_id, title: m.title, description: m.description, why: m.why, category: m.category, locationName: m.location_name, latitude: m.latitude, longitude: m.longitude, durationMinutes: m.duration_minutes, estimatedCost: m.estimated_cost, rating: m.rating, wouldDoAgain: m.would_do_again, createdAt: m.created_at, updatedAt: m.updated_at });

export async function getMyJourneys(status?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  let query = supabase.from("journeys").select("*, moments(*), moment_media(media_url,sort_order)").eq("user_id", user.id).order("created_at", { ascending: false });
  if (status && status !== "ALL") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((j: any): Journey => ({
    id: j.id, userId: j.user_id, momentId: j.moment_id, status: j.status,
    plannedAt: j.planned_at, startedAt: j.started_at, completedAt: j.completed_at,
    createdAt: j.created_at, updatedAt: j.updated_at,
    moment: j.moments ? mapMoment(j.moments) : undefined,
    mediaUrl: j.moment_media?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0]?.media_url ?? null,
  }));
}

import { createClient } from "@/lib/supabase/server";
import type { Journey, Moment } from "@/types/moment";

const mapMoment = (m: any): Moment => ({
  id: m.id,
  userId: m.user_id,
  title: m.title,
  description: m.description,
  why: m.why,
  category: m.category,
  locationName: m.location_name,
  latitude: m.latitude,
  longitude: m.longitude,
  durationMinutes: m.duration_minutes,
  estimatedCost: m.estimated_cost,
  rating: m.rating,
  wouldDoAgain: m.would_do_again,
  createdAt: m.created_at,
  updatedAt: m.updated_at,
});

const allowedStatuses = new Set(["ALL", "PLANNED", "TRYING", "COMPLETED"]);

export async function getMyJourneys(status?: string): Promise<Journey[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return [];

  const normalizedStatus = status?.toUpperCase() ?? "ALL";
  if (!allowedStatuses.has(normalizedStatus)) return [];

  let query = supabase
    .from("journeys")
    .select(`
      id,
      user_id,
      moment_id,
      status,
      planned_at,
      started_at,
      completed_at,
      created_at,
      updated_at,
      moments (
        id,
        user_id,
        title,
        description,
        why,
        category,
        location_name,
        latitude,
        longitude,
        duration_minutes,
        estimated_cost,
        rating,
        would_do_again,
        created_at,
        updated_at,
        moment_media (
          media_url,
          sort_order
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (normalizedStatus !== "ALL") query = query.eq("status", normalizedStatus);

  const { data, error } = await query;
  if (error) {
    console.error("getMyJourneys query failed", error);
    return [];
  }

  return (data ?? []).map((j: any): Journey => {
    const media = Array.isArray(j.moments?.moment_media) ? j.moments.moment_media : [];
    const firstMedia = [...media].sort((a, b) => a.sort_order - b.sort_order)[0];
    return {
      id: j.id,
      userId: j.user_id,
      momentId: j.moment_id,
      status: j.status,
      plannedAt: j.planned_at,
      startedAt: j.started_at,
      completedAt: j.completed_at,
      createdAt: j.created_at,
      updatedAt: j.updated_at,
      moment: j.moments ? mapMoment(j.moments) : undefined,
      mediaUrl: firstMedia?.media_url ?? null,
    };
  });
}

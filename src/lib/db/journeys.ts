import { createClient } from "@/lib/supabase/server";
import type { Journey, JourneyStatus, Moment } from "@/types/moment";

type JourneyMediaRow = { media_url: string; sort_order: number };
type JourneyMomentRow = {
  id: string; user_id: string; title: string; description: string; why: string | null; category: Moment["category"];
  location_name: string | null; latitude: number | null; longitude: number | null; duration_minutes: number | null;
  estimated_cost: number | null; experience_note: string | null; rating: number; would_do_again: boolean;
  created_at: string; updated_at: string; moment_media: JourneyMediaRow[] | null;
};
type JourneyRow = {
  id: string; user_id: string; moment_id: string | null; moment_title_snapshot: string | null; moment_category_snapshot: string | null;
  moment_media_url_snapshot: string | null; status: JourneyStatus; planned_at: string | null; started_at: string | null; completed_at: string | null;
  created_at: string; updated_at: string; moments: JourneyMomentRow | null;
};

const mapMoment = (m: JourneyMomentRow): Moment => ({
  id: m.id, userId: m.user_id, title: m.title, description: m.description, why: m.why, category: m.category,
  locationName: m.location_name, latitude: m.latitude, longitude: m.longitude, durationMinutes: m.duration_minutes,
  estimatedCost: m.estimated_cost, experienceNote: m.experience_note, rating: m.rating, wouldDoAgain: m.would_do_again,
  createdAt: m.created_at, updatedAt: m.updated_at,
});

const allowedStatuses = new Set<"ALL" | JourneyStatus>(["ALL", "PLANNED", "TRYING", "COMPLETED"]);

export async function getMyJourneys(status?: string): Promise<Journey[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return [];

  const normalizedStatus = status?.toUpperCase() ?? "ALL";
  if (!allowedStatuses.has(normalizedStatus as "ALL" | JourneyStatus)) return [];

  let query = supabase.from("journeys").select(`
    id,user_id,moment_id,moment_title_snapshot,moment_category_snapshot,moment_media_url_snapshot,
    status,planned_at,started_at,completed_at,created_at,updated_at,
    moments (id,user_id,title,description,why,category,location_name,latitude,longitude,duration_minutes,estimated_cost,experience_note,rating,would_do_again,created_at,updated_at,moment_media(media_url,sort_order))
  `).eq("user_id", user.id).order("created_at", { ascending: false });
  if (normalizedStatus !== "ALL") query = query.eq("status", normalizedStatus);

  const { data, error } = await query;
  if (error) { console.error("getMyJourneys query failed", error); return []; }

  return ((data ?? []) as unknown as JourneyRow[]).map((j): Journey => {
    const media = Array.isArray(j.moments?.moment_media) ? j.moments.moment_media : [];
    const firstMedia = [...media].sort((a, b) => a.sort_order - b.sort_order)[0];
    return {
      id: j.id, userId: j.user_id, momentId: j.moment_id, status: j.status, plannedAt: j.planned_at, startedAt: j.started_at,
      completedAt: j.completed_at, createdAt: j.created_at, updatedAt: j.updated_at,
      moment: j.moments ? mapMoment(j.moments) : undefined,
      momentTitle: j.moment_title_snapshot ?? j.moments?.title ?? "Deleted Moment",
      momentCategory: j.moment_category_snapshot ?? j.moments?.category ?? null,
      mediaUrl: j.moment_media_url_snapshot ?? firstMedia?.media_url ?? null,
    };
  });
}

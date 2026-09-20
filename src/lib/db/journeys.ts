import { createClient } from "@/lib/supabase/server";
import type { Journey, JourneyStatus, Moment } from "@/types/moment";

type JourneyRow = {
  id: string; user_id: string; moment_id: string | null; moment_title_snapshot: string | null; moment_category_snapshot: string | null;
  moment_media_url_snapshot: string | null; status: JourneyStatus; planned_at: string | null; started_at: string | null; completed_at: string | null;
  experience_recorded_at: string | null; experience_note: string | null; experience_media_url: string | null; experience_location_name: string | null;
  created_at: string; updated_at: string;
};

type MomentLite = { id: string; user_id: string; title: string; category: Moment["category"] };
const allowedStatuses = new Set<"ALL" | JourneyStatus>(["ALL", "PLANNED", "TRYING", "COMPLETED"]);

export async function getMyJourneys(status?: string): Promise<Journey[]> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return [];
  const normalizedStatus = status?.toUpperCase() ?? "ALL";
  if (!allowedStatuses.has(normalizedStatus as "ALL" | JourneyStatus)) return [];

  let query = supabase.from("journeys").select("id,user_id,moment_id,moment_title_snapshot,moment_category_snapshot,moment_media_url_snapshot,status,planned_at,started_at,completed_at,experience_recorded_at,experience_note,experience_media_url,experience_location_name,created_at,updated_at").eq("user_id", user.id).order("created_at", { ascending: false });
  if (normalizedStatus !== "ALL") query = query.eq("status", normalizedStatus);
  const { data, error } = await query;
  if (error) { console.error("getMyJourneys query failed", error); return []; }

  const rows = (data ?? []) as unknown as JourneyRow[];
  const liveMomentIds = rows.map((j) => j.moment_id).filter((id): id is string => Boolean(id));
  const { data: moments } = liveMomentIds.length ? await supabase.from("moments").select("id,user_id,title,category").in("id", liveMomentIds) : { data: [] as MomentLite[] };
  const momentMap = new Map(((moments ?? []) as unknown as MomentLite[]).map((m) => [m.id, m]));

  return rows.map((j): Journey => {
    const moment = j.moment_id ? momentMap.get(j.moment_id) : undefined;
    return {
      id: j.id, userId: j.user_id, momentId: j.moment_id, status: j.status, plannedAt: j.planned_at, startedAt: j.started_at,
      completedAt: j.completed_at, experienceRecordedAt: j.experience_recorded_at, experienceNote: j.experience_note,
      experienceMediaUrl: j.experience_media_url, experienceLocationName: j.experience_location_name,
      createdAt: j.created_at, updatedAt: j.updated_at, momentTitle: j.moment_title_snapshot ?? moment?.title ?? "Deleted Moment",
      momentCategory: j.moment_category_snapshot ?? moment?.category ?? null, mediaUrl: j.moment_media_url_snapshot ?? null,
    };
  });
}

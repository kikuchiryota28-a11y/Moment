"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action";
import type { JourneyStatus } from "@/types/moment";

const journeyStatuses = new Set<JourneyStatus>(["PLANNED", "TRYING", "COMPLETED"]);
const MAX_EXPERIENCE_NOTE = 1000;
const MAX_LOCATION = 200;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EXPERIENCE_BUCKET = "moment-media";
type TransitionStatus = "TRYING" | "COMPLETED";
function isUuid(value: string) { return /^[0-9a-f-]{36}$/i.test(value); }

export async function tryMoment(momentId: string): Promise<ActionResult<{ status: JourneyStatus }>> {
  if (!momentId || !isUuid(momentId)) return { success: false, error: "Invalid Moment.", code: "INVALID_MOMENT_ID" };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    const { data: moment, error: momentError } = await supabase.from("moments").select("id,user_id,title,category").eq("id", momentId).maybeSingle();
    if (momentError) return { success: false, error: "Momentを取得できませんでした。", code: "MOMENT_LOOKUP_FAILED" };
    if (!moment) return { success: false, error: "Moment not found.", code: "MOMENT_NOT_FOUND" };
    if (moment.user_id === user.id) return { success: false, error: "You cannot TRY your own Moment.", code: "OWN_MOMENT" };
    const { data: existing, error: existingError } = await supabase.from("journeys").select("id,status").eq("user_id", user.id).eq("moment_id", momentId).maybeSingle();
    if (existingError) return { success: false, error: "Journeyを確認できませんでした。", code: "JOURNEY_LOOKUP_FAILED" };
    if (existing) {
      const status = existing.status as JourneyStatus;
      if (!journeyStatuses.has(status)) return { success: false, error: "Invalid Journey status.", code: "INVALID_STATUS" };
      revalidatePath("/journey"); revalidatePath(`/moment/${momentId}`);
      return { success: true, data: { status } };
    }
    const { data: cover } = await supabase.from("moment_media").select("media_url").eq("moment_id", momentId).order("sort_order").limit(1).maybeSingle();
    const { data, error } = await supabase.from("journeys").insert({ user_id: user.id, moment_id: momentId, moment_title_snapshot: moment.title, moment_category_snapshot: moment.category, moment_media_url_snapshot: cover?.media_url ?? null, status: "TRYING", planned_at: null, started_at: new Date().toISOString() }).select("status").single();
    if (error || !data) return { success: false, error: "Journeyへの追加に失敗しました。", code: "JOURNEY_INSERT_FAILED" };
    revalidatePath("/journey"); revalidatePath(`/moment/${momentId}`);
    return { success: true, data: { status: data.status as JourneyStatus } };
  } catch (error) { console.error("tryMoment unexpected failure", error); return { success: false, error: "TRYに失敗しました。", code: "TRY_FAILED" }; }
}

export async function planJourney(journeyId: string, plannedAt: string): Promise<ActionResult<{ plannedAt: string }>> {
  if (!isUuid(journeyId)) return { success: false, error: "Invalid Journey.", code: "INVALID_JOURNEY_ID" };
  const parsed = new Date(plannedAt);
  if (Number.isNaN(parsed.getTime())) return { success: false, error: "予定日時が正しくありません。", code: "INVALID_PLANNED_AT" };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    const { data, error } = await supabase.from("journeys").update({ planned_at: parsed.toISOString() }).eq("id", journeyId).eq("user_id", user.id).eq("status", "PLANNED").select("planned_at").maybeSingle();
    if (error || !data) return { success: false, error: "予定日の保存に失敗しました。", code: "PLAN_FAILED" };
    revalidatePath("/journey"); return { success: true, data: { plannedAt: data.planned_at } };
  } catch (error) { console.error("planJourney unexpected failure", error); return { success: false, error: "予定日の保存に失敗しました。", code: "PLAN_FAILED" }; }
}

export async function startJourney(journeyId: string): Promise<ActionResult<{ status: "TRYING" }>> { return transitionJourney(journeyId, "PLANNED", "TRYING", { status: "TRYING", started_at: new Date().toISOString() }); }
export async function completeJourney(journeyId: string): Promise<ActionResult<{ status: "COMPLETED" }>> { return transitionJourney(journeyId, "TRYING", "COMPLETED", { status: "COMPLETED", completed_at: new Date().toISOString() }); }

export async function recordExperience(formData: FormData): Promise<ActionResult<{ status: "COMPLETED" }>> {
  const journeyId = String(formData.get("journeyId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const photo = formData.get("photo");
  if (!isUuid(journeyId)) return { success: false, error: "Invalid Journey.", code: "INVALID_JOURNEY_ID" };
  if (!note || note.length > MAX_EXPERIENCE_NOTE) return { success: false, error: "経験メモを1〜1000文字で入力してください。", code: "INVALID_EXPERIENCE_NOTE" };
  if (location.length > MAX_LOCATION) return { success: false, error: "場所は200文字以内で入力してください。", code: "INVALID_EXPERIENCE_LOCATION" };
  if (!(photo instanceof File) || photo.size === 0) return { success: false, error: "経験を残す写真を1枚追加してください。", code: "EXPERIENCE_PHOTO_REQUIRED" };
  if (!photo.type.startsWith("image/") || photo.size > MAX_IMAGE_BYTES) return { success: false, error: "写真は5MB以下の画像を選択してください。", code: "INVALID_EXPERIENCE_PHOTO" };
  let uploadedPath: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    const { data: journey, error: journeyError } = await supabase.from("journeys").select("id,status,moment_id").eq("id", journeyId).eq("user_id", user.id).maybeSingle();
    if (journeyError) return { success: false, error: "Journeyを取得できませんでした。", code: "JOURNEY_LOOKUP_FAILED" };
    if (!journey) return { success: false, error: "Journey not found.", code: "JOURNEY_NOT_FOUND" };
    if (journey.status !== "COMPLETED") return { success: false, error: "先に体験をCompleteしてください。", code: "INVALID_EXPERIENCE_STATE" };
    const extension = (photo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    uploadedPath = `${user.id}/experiences/${journeyId}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(EXPERIENCE_BUCKET).upload(uploadedPath, photo, { contentType: photo.type, cacheControl: "31536000", upsert: false });
    if (uploadError) return { success: false, error: "写真の保存に失敗しました。", code: "EXPERIENCE_UPLOAD_FAILED" };
    const { data: publicData } = supabase.storage.from(EXPERIENCE_BUCKET).getPublicUrl(uploadedPath);
    const { error: updateError } = await supabase.from("journeys").update({ experience_note: note, experience_media_url: publicData.publicUrl, experience_location_name: location || null, experience_recorded_at: new Date().toISOString() }).eq("id", journeyId).eq("user_id", user.id).eq("status", "COMPLETED");
    if (updateError) { await supabase.storage.from(EXPERIENCE_BUCKET).remove([uploadedPath]); return { success: false, error: "Experienceの保存に失敗しました。", code: "EXPERIENCE_SAVE_FAILED" }; }
    revalidatePath("/journey"); revalidatePath("/profile", "layout"); if (journey.moment_id) revalidatePath(`/moment/${journey.moment_id}`);
    return { success: true, data: { status: "COMPLETED" } };
  } catch (error) { console.error("recordExperience unexpected failure", error); if (uploadedPath) { try { const supabase = await createClient(); await supabase.storage.from(EXPERIENCE_BUCKET).remove([uploadedPath]); } catch (cleanupError) { console.error("recordExperience cleanup failed", cleanupError); } } return { success: false, error: "Experienceの保存に失敗しました。", code: "EXPERIENCE_SAVE_FAILED" }; }
}

async function transitionJourney<T extends TransitionStatus>(journeyId: string, expected: "PLANNED" | "TRYING", nextStatus: T, patch: Record<string, string>): Promise<ActionResult<{ status: T }>> {
  if (!journeyId || !isUuid(journeyId)) return { success: false, error: "Invalid Journey.", code: "INVALID_JOURNEY_ID" };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    const { data: journey, error: journeyError } = await supabase.from("journeys").select("id,status,moment_id").eq("id", journeyId).eq("user_id", user.id).maybeSingle();
    if (journeyError) return { success: false, error: "Journeyを取得できませんでした。", code: "JOURNEY_LOOKUP_FAILED" };
    if (!journey) return { success: false, error: "Journey not found.", code: "JOURNEY_NOT_FOUND" };
    if (journey.status !== expected) return { success: false, error: `Invalid transition: ${journey.status} → ${nextStatus}.`, code: "INVALID_TRANSITION" };
    const { error } = await supabase.from("journeys").update(patch).eq("id", journeyId).eq("user_id", user.id).eq("status", expected);
    if (error) return { success: false, error: "Journeyの更新に失敗しました。", code: "JOURNEY_UPDATE_FAILED" };
    revalidatePath("/journey"); if (journey.moment_id) revalidatePath(`/moment/${journey.moment_id}`);
    return { success: true, data: { status: nextStatus } };
  } catch (error) { console.error("transitionJourney unexpected failure", error); return { success: false, error: "Journeyの更新に失敗しました。", code: "JOURNEY_UPDATE_FAILED" }; }
}

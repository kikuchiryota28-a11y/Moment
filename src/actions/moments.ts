"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateMomentInput, type CreateMomentInput, type UpdateMomentInput } from "@/lib/validation/moments";
import type { ActionResult } from "@/types/action";

function storagePathFromPublicUrl(url: string, bucket: "moment-media" | "avatars"): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !url.startsWith(`${base}/storage/v1/object/public/${bucket}/`)) return null;
  return decodeURIComponent(url.slice(`${base}/storage/v1/object/public/${bucket}/`.length));
}
function validateOwnedMediaUrls(media: CreateMomentInput["media"], userId: string): boolean {
  return media.every((item) => { const path = storagePathFromPublicUrl(item.url, "moment-media"); return Boolean(path && path.startsWith(`${userId}/`)); });
}
function ownedMediaPaths(media: CreateMomentInput["media"], userId: string): string[] {
  return media.map((item) => storagePathFromPublicUrl(item.url, "moment-media")).filter((path): path is string => Boolean(path && path.startsWith(`${userId}/`)));
}

export async function createMoment(input: CreateMomentInput): Promise<ActionResult<{ id: string }>> {
  const errors = validateMomentInput(input);
  if (Object.keys(errors).length) return { success: false, error: Object.values(errors)[0] ?? "Invalid Moment.", code: "VALIDATION_FAILED" };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    if (!validateOwnedMediaUrls(input.media, user.id)) return { success: false, error: "One or more media files are invalid.", code: "INVALID_MEDIA_OWNERSHIP" };
    const { data: profile, error: profileError } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
    if (profileError || !profile) { console.error("createMoment profile lookup failed", profileError); return { success: false, error: "Profile could not be loaded.", code: "PROFILE_LOOKUP_FAILED" }; }
    const { data: moment, error: momentError } = await supabase.from("moments").insert({ user_id: user.id, title: input.title.trim(), description: input.description.trim(), why: input.why?.trim() || null, category: input.category, location_name: input.location?.trim() || null, duration_minutes: input.durationMinutes || null, estimated_cost: input.estimatedCost ?? null, experience_note: input.experienceNote?.trim() || null, rating: input.rating, would_do_again: input.wouldDoAgain }).select("id").single();
    if (momentError || !moment) { console.error("createMoment moment insert failed", momentError); return { success: false, error: "Momentの保存に失敗しました。", code: "MOMENT_INSERT_FAILED" }; }
    const mediaRows = input.media.map((item, index) => ({ moment_id: moment.id, media_url: item.url, media_type: item.type ?? "image", sort_order: index }));
    const { error: mediaError } = await supabase.from("moment_media").insert(mediaRows);
    if (mediaError) {
      console.error("createMoment media insert failed", mediaError);
      await supabase.from("moments").delete().eq("id", moment.id).eq("user_id", user.id);
      const { error: cleanupError } = await supabase.storage.from("moment-media").remove(ownedMediaPaths(input.media, user.id));
      if (cleanupError) console.error("createMoment media rollback cleanup failed", cleanupError);
      return { success: false, error: "画像情報の保存に失敗しました。", code: "MEDIA_INSERT_FAILED" };
    }
    revalidatePath("/");
    revalidatePath(`/profile/${profile.username}`);
    revalidatePath(`/moment/${moment.id}`);
    return { success: true, data: { id: moment.id } };
  } catch (error) {
    console.error("createMoment unexpected failure", error);
    return { success: false, error: "Momentの公開に失敗しました。", code: "MOMENT_CREATE_FAILED" };
  }
}

export async function updateMoment(input: UpdateMomentInput): Promise<ActionResult<{ id: string }>> {
  if (!input.momentId || !/^[0-9a-f-]{36}$/i.test(input.momentId)) return { success: false, error: "Invalid Moment.", code: "INVALID_MOMENT_ID" };
  const errors = validateMomentInput(input);
  if (Object.keys(errors).length) return { success: false, error: Object.values(errors)[0] ?? "Invalid Moment.", code: "VALIDATION_FAILED" };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    if (!validateOwnedMediaUrls(input.media, user.id)) return { success: false, error: "One or more media files are invalid.", code: "INVALID_MEDIA_OWNERSHIP" };
    const { data: current, error: currentError } = await supabase.from("moments").select("id,user_id").eq("id", input.momentId).maybeSingle();
    if (currentError) { console.error("updateMoment lookup failed", currentError); return { success: false, error: "Moment could not be loaded.", code: "MOMENT_LOOKUP_FAILED" }; }
    if (!current) return { success: false, error: "Moment not found.", code: "MOMENT_NOT_FOUND" };
    if (current.user_id !== user.id) return { success: false, error: "You can only edit your own Moment.", code: "FORBIDDEN" };
    const { error: updateError } = await supabase.from("moments").update({ title: input.title.trim(), description: input.description.trim(), why: input.why?.trim() || null, category: input.category, location_name: input.location?.trim() || null, duration_minutes: input.durationMinutes ?? null, estimated_cost: input.estimatedCost ?? null, experience_note: input.experienceNote?.trim() || null, rating: input.rating, would_do_again: input.wouldDoAgain }).eq("id", input.momentId).eq("user_id", user.id);
    if (updateError) { console.error("updateMoment update failed", updateError); return { success: false, error: "Moment could not be saved.", code: "MOMENT_UPDATE_FAILED" }; }
    const { data: oldMedia, error: oldMediaError } = await supabase.from("moment_media").select("media_url").eq("moment_id", input.momentId);
    if (oldMediaError) { console.error("updateMoment media lookup failed", oldMediaError); return { success: false, error: "Moment media could not be updated.", code: "MEDIA_LOOKUP_FAILED" }; }
    const keep = new Set(input.media.map((item) => item.url));
    const removedPaths = ((oldMedia ?? []) as Array<{ media_url: string }>).filter((item) => !keep.has(item.media_url)).map((item) => storagePathFromPublicUrl(item.media_url, "moment-media")).filter((path): path is string => Boolean(path && path.startsWith(`${user.id}/`)));
    const quotedUrls = input.media.map((item) => `"${item.url.replaceAll('"', '""')}"`).join(",");
    const { error: deleteMediaError } = await supabase.from("moment_media").delete().eq("moment_id", input.momentId).not("media_url", "in", `(${quotedUrls})`);
    if (deleteMediaError) { console.error("updateMoment media delete failed", deleteMediaError); return { success: false, error: "Moment media could not be updated.", code: "MEDIA_UPDATE_FAILED" }; }
    const { data: remaining } = await supabase.from("moment_media").select("media_url").eq("moment_id", input.momentId);
    const existingUrls = new Set(((remaining ?? []) as Array<{ media_url: string }>).map((item) => item.media_url));
    const newRows = input.media.filter((item) => !existingUrls.has(item.url)).map((item, index) => ({ moment_id: input.momentId, media_url: item.url, media_type: item.type ?? "image", sort_order: index }));
    if (newRows.length) {
      const { error: insertMediaError } = await supabase.from("moment_media").insert(newRows);
      if (insertMediaError) { console.error("updateMoment media insert failed", insertMediaError); return { success: false, error: "Moment media could not be updated.", code: "MEDIA_UPDATE_FAILED" }; }
    }
    if (removedPaths.length) { const { error: storageError } = await supabase.storage.from("moment-media").remove(removedPaths); if (storageError) console.error("updateMoment old media cleanup failed", storageError); }
    revalidatePath("/");
    revalidatePath(`/moment/${input.momentId}`);
    return { success: true, data: { id: input.momentId } };
  } catch (error) {
    console.error("updateMoment unexpected failure", error);
    return { success: false, error: "Moment could not be saved.", code: "MOMENT_UPDATE_FAILED" };
  }
}

export async function deleteMoment(momentId: string): Promise<ActionResult<undefined>> {
  if (!momentId || !/^[0-9a-f-]{36}$/i.test(momentId)) return { success: false, error: "Invalid Moment.", code: "INVALID_MOMENT_ID" };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    const [{ data: moment, error: momentError }, { data: media, error: mediaError }] = await Promise.all([supabase.from("moments").select("id,user_id").eq("id", momentId).maybeSingle(), supabase.from("moment_media").select("media_url").eq("moment_id", momentId)]);
    if (momentError || !moment) return { success: false, error: "Moment not found.", code: "MOMENT_NOT_FOUND" };
    if (mediaError) { console.error("deleteMoment media lookup failed", mediaError); return { success: false, error: "Moment media could not be loaded.", code: "MEDIA_LOOKUP_FAILED" }; }
    if (moment.user_id !== user.id) return { success: false, error: "You can only delete your own Moment.", code: "FORBIDDEN" };
    const { error: deleteError } = await supabase.from("moments").delete().eq("id", momentId).eq("user_id", user.id);
    if (deleteError) { console.error("deleteMoment delete failed", deleteError); return { success: false, error: "Moment could not be deleted.", code: "MOMENT_DELETE_FAILED" }; }
    const paths = ((media ?? []) as Array<{ media_url: string }>).map((item) => storagePathFromPublicUrl(item.media_url, "moment-media")).filter((path): path is string => Boolean(path && path.startsWith(`${user.id}/`)));
    if (paths.length) { const { error: storageError } = await supabase.storage.from("moment-media").remove(paths); if (storageError) console.error("deleteMoment storage cleanup failed", storageError); }
    revalidatePath("/"); revalidatePath("/journey"); revalidatePath("/profile/me"); revalidatePath(`/moment/${momentId}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteMoment unexpected failure", error);
    return { success: false, error: "Moment could not be deleted.", code: "MOMENT_DELETE_FAILED" };
  }
}

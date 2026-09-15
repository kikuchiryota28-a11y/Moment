"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateCreateMoment, type CreateMomentInput } from "@/lib/validation/moments";
import type { ActionResult } from "@/types/action";

export async function createMoment(
  input: CreateMomentInput,
): Promise<ActionResult<{ id: string }>> {
  const errors = validateCreateMoment(input);
  if (Object.keys(errors).length) {
    return {
      success: false,
      error: Object.values(errors)[0] ?? "Invalid Moment.",
      code: "VALIDATION_FAILED",
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      console.error("createMoment profile lookup failed", profileError);
      return { success: false, error: "Profile could not be loaded.", code: "PROFILE_LOOKUP_FAILED" };
    }
    if (!profile) {
      return { success: false, error: "Profile not found.", code: "PROFILE_NOT_FOUND" };
    }

    const { data: moment, error: momentError } = await supabase
      .from("moments")
      .insert({
        user_id: user.id,
        title: input.title.trim(),
        description: input.description.trim(),
        why: input.why?.trim() || null,
        category: input.category,
        location_name: input.location?.trim() || null,
        duration_minutes: input.durationMinutes || null,
        estimated_cost: input.estimatedCost || null,
        rating: input.rating,
        would_do_again: input.wouldDoAgain,
      })
      .select("id")
      .single();

    if (momentError || !moment) {
      console.error("createMoment moment insert failed", momentError);
      return { success: false, error: "Momentの保存に失敗しました。", code: "MOMENT_INSERT_FAILED" };
    }

    const mediaRows = input.media.map((item, index) => ({
      moment_id: moment.id,
      media_url: item.url,
      media_type: item.type ?? "image",
      sort_order: index,
    }));

    const { error: mediaError } = await supabase.from("moment_media").insert(mediaRows);
    if (mediaError) {
      console.error("createMoment media insert failed", mediaError);
      await supabase.from("moments").delete().eq("id", moment.id).eq("user_id", user.id);
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

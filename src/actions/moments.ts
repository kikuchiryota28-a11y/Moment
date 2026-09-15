"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateCreateMoment, type CreateMomentInput } from "@/lib/validation/moments";

export async function createMoment(input: CreateMomentInput) {
  const errors = validateCreateMoment(input);
  if (Object.keys(errors).length) return { ok: false as const, errors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Authentication required." };

  const { data: moment, error } = await supabase.from("moments").insert({
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
  }).select("id").single();
  if (error) return { ok: false as const, error: error.message };

  const mediaRows = input.media.map((item, index) => ({
    moment_id: moment.id,
    media_url: item.url,
    media_type: item.type ?? "image",
    sort_order: index,
  }));
  const { error: mediaError } = await supabase.from("moment_media").insert(mediaRows);
  if (mediaError) return { ok: false as const, error: mediaError.message };

  revalidatePath("/");
  revalidatePath(`/profile/${user.user_metadata?.username ?? ""}`);
  return { ok: true as const, id: moment.id };
}

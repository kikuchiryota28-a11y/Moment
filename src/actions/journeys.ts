"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action";
import type { JourneyStatus } from "@/types/moment";

const journeyStatuses = new Set<JourneyStatus>(["PLANNED", "TRYING", "COMPLETED"]);

type TransitionStatus = "TRYING" | "COMPLETED";

export async function tryMoment(
  momentId: string,
): Promise<ActionResult<{ status: JourneyStatus }>> {
  if (!momentId || !/^[0-9a-f-]{36}$/i.test(momentId)) {
    return { success: false, error: "Invalid Moment.", code: "INVALID_MOMENT_ID" };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    }

    const { data: moment, error: momentError } = await supabase
      .from("moments")
      .select("id,user_id")
      .eq("id", momentId)
      .maybeSingle();
    if (momentError) {
      console.error("tryMoment moment lookup failed", momentError);
      return { success: false, error: "Momentを取得できませんでした。", code: "MOMENT_LOOKUP_FAILED" };
    }
    if (!moment) return { success: false, error: "Moment not found.", code: "MOMENT_NOT_FOUND" };
    if (moment.user_id === user.id) {
      return { success: false, error: "You cannot TRY your own Moment.", code: "OWN_MOMENT" };
    }

    const { data: existing, error: existingError } = await supabase
      .from("journeys")
      .select("id,status")
      .eq("user_id", user.id)
      .eq("moment_id", momentId)
      .maybeSingle();
    if (existingError) {
      console.error("tryMoment journey lookup failed", existingError);
      return { success: false, error: "Journeyを確認できませんでした。", code: "JOURNEY_LOOKUP_FAILED" };
    }
    if (existing) {
      const status = existing.status as JourneyStatus;
      if (!journeyStatuses.has(status)) {
        return { success: false, error: "Invalid Journey status.", code: "INVALID_STATUS" };
      }
      revalidatePath("/journey");
      revalidatePath(`/moment/${momentId}`);
      return { success: true, data: { status } };
    }

    const { data, error } = await supabase
      .from("journeys")
      .insert({ user_id: user.id, moment_id: momentId, status: "PLANNED", planned_at: new Date().toISOString() })
      .select("status")
      .single();
    if (error || !data) {
      console.error("tryMoment journey insert failed", error);
      return { success: false, error: "Journeyへの追加に失敗しました。", code: "JOURNEY_INSERT_FAILED" };
    }

    revalidatePath("/journey");
    revalidatePath(`/moment/${momentId}`);
    return { success: true, data: { status: data.status as JourneyStatus } };
  } catch (error) {
    console.error("tryMoment unexpected failure", error);
    return { success: false, error: "TRYに失敗しました。", code: "TRY_FAILED" };
  }
}

export async function startJourney(
  journeyId: string,
): Promise<ActionResult<{ status: "TRYING" }>> {
  return transitionJourney(journeyId, "PLANNED", "TRYING", { status: "TRYING", started_at: new Date().toISOString() });
}

export async function completeJourney(
  journeyId: string,
): Promise<ActionResult<{ status: "COMPLETED" }>> {
  return transitionJourney(journeyId, "TRYING", "COMPLETED", { status: "COMPLETED", completed_at: new Date().toISOString() });
}

async function transitionJourney(
  journeyId: string,
  expected: "PLANNED" | "TRYING",
  nextStatus: TransitionStatus,
  patch: Record<string, string>,
): Promise<ActionResult<{ status: TransitionStatus }>> {
  if (!journeyId || !/^[0-9a-f-]{36}$/i.test(journeyId)) {
    return { success: false, error: "Invalid Journey.", code: "INVALID_JOURNEY_ID" };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };

    const { data: journey, error: journeyError } = await supabase
      .from("journeys")
      .select("id,status,moment_id")
      .eq("id", journeyId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (journeyError) {
      console.error("transitionJourney lookup failed", journeyError);
      return { success: false, error: "Journeyを取得できませんでした。", code: "JOURNEY_LOOKUP_FAILED" };
    }
    if (!journey) return { success: false, error: "Journey not found.", code: "JOURNEY_NOT_FOUND" };
    if (journey.status !== expected) {
      return { success: false, error: `Invalid transition: ${journey.status} → ${nextStatus}.`, code: "INVALID_TRANSITION" };
    }

    const { error } = await supabase
      .from("journeys")
      .update(patch)
      .eq("id", journeyId)
      .eq("user_id", user.id)
      .eq("status", expected);
    if (error) {
      console.error("transitionJourney update failed", error);
      return { success: false, error: "Journeyの更新に失敗しました。", code: "JOURNEY_UPDATE_FAILED" };
    }

    revalidatePath("/journey");
    revalidatePath(`/moment/${journey.moment_id}`);
    return { success: true, data: { status: nextStatus } };
  } catch (error) {
    console.error("transitionJourney unexpected failure", error);
    return { success: false, error: "Journeyの更新に失敗しました。", code: "JOURNEY_UPDATE_FAILED" };
  }
}

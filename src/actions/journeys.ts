"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function tryMoment(momentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Authentication required." };

  const { data: moment, error: momentError } = await supabase.from("moments").select("id,user_id").eq("id", momentId).maybeSingle();
  if (momentError) return { ok: false as const, error: momentError.message };
  if (!moment) return { ok: false as const, error: "Moment not found." };
  if (moment.user_id === user.id) return { ok: false as const, error: "You cannot TRY your own Moment." };

  const { data: existing } = await supabase.from("journeys").select("id,status").eq("user_id", user.id).eq("moment_id", momentId).maybeSingle();
  if (existing) {
    revalidatePath("/journey");
    revalidatePath(`/moment/${momentId}`);
    return { ok: true as const, status: existing.status };
  }

  const { data, error } = await supabase.from("journeys").insert({ user_id: user.id, moment_id: momentId, status: "PLANNED", planned_at: new Date().toISOString() }).select("status").single();
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/journey");
  revalidatePath(`/moment/${momentId}`);
  return { ok: true as const, status: data.status };
}

export async function startJourney(journeyId: string) {
  return transitionJourney(journeyId, "PLANNED", { status: "TRYING", started_at: new Date().toISOString() });
}

export async function completeJourney(journeyId: string) {
  return transitionJourney(journeyId, "TRYING", { status: "COMPLETED", completed_at: new Date().toISOString() });
}

async function transitionJourney(journeyId: string, expected: "PLANNED" | "TRYING", patch: Record<string, string>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Authentication required." };

  const { data: journey } = await supabase.from("journeys").select("id,status,moment_id").eq("id", journeyId).eq("user_id", user.id).maybeSingle();
  if (!journey) return { ok: false as const, error: "Journey not found." };
  if (journey.status !== expected) return { ok: false as const, error: `Invalid transition: ${journey.status} → ${patch.status}.` };

  const { error } = await supabase.from("journeys").update(patch).eq("id", journeyId).eq("user_id", user.id).eq("status", expected);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/journey");
  revalidatePath(`/moment/${journey.moment_id}`);
  return { ok: true as const, status: patch.status };
}

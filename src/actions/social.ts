"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  return { supabase, currentUser };
}

export async function toggleLike(momentId: string) {
  const { supabase, currentUser } = await getCurrentUser();
  if (!currentUser) return { ok: false as const, error: "Authentication required." };
  const { data: existing } = await supabase.from("likes").select("user_id").eq("user_id", currentUser.id).eq("moment_id", momentId).maybeSingle();
  if (existing) await supabase.from("likes").delete().eq("user_id", currentUser.id).eq("moment_id", momentId);
  else await supabase.from("likes").insert({ user_id: currentUser.id, moment_id: momentId });
  revalidatePath(`/moment/${momentId}`);
  return { ok: true as const, liked: !existing };
}

export async function addComment(momentId: string, body: string) {
  const { supabase, currentUser } = await getCurrentUser();
  if (!currentUser) return { ok: false as const, error: "Authentication required." };
  const clean = body.trim();
  if (!clean || clean.length > 500) return { ok: false as const, error: "Comment must be 1–500 characters." };
  const { error } = await supabase.from("comments").insert({ user_id: currentUser.id, moment_id: momentId, body: clean });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/moment/${momentId}`);
  return { ok: true as const };
}

export async function toggleFollow(targetProfileId: string) {
  const { supabase, currentUser } = await getCurrentUser();
  if (!currentUser) return { ok: false as const, error: "Authentication required." };
  if (currentUser.id === targetProfileId) return { ok: false as const, error: "You cannot follow yourself." };
  const { data: existing } = await supabase.from("follows").select("follower_id").eq("follower_id", currentUser.id).eq("following_id", targetProfileId).maybeSingle();
  if (existing) await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", targetProfileId);
  else await supabase.from("follows").insert({ follower_id: currentUser.id, following_id: targetProfileId });
  return { ok: true as const, following: !existing };
}

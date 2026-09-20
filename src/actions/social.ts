"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action";

async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user: currentUser }, error } = await supabase.auth.getUser();
  return { supabase, currentUser, error };
}

export async function setMomentLike(
  momentId: string,
  liked: boolean,
): Promise<ActionResult<{ liked: boolean }>> {
  if (!momentId || !/^[0-9a-f-]{36}$/i.test(momentId)) {
    return { success: false, error: "Invalid Moment.", code: "INVALID_MOMENT_ID" };
  }

  try {
    const { supabase, currentUser, error: authError } = await getCurrentUser();
    if (authError || !currentUser) {
      return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    }

    const { data: moment, error: momentError } = await supabase
      .from("moments")
      .select("id")
      .eq("id", momentId)
      .maybeSingle();
    if (momentError) {
      console.error("setMomentLike moment lookup failed", momentError);
      return { success: false, error: "Momentを確認できませんでした。", code: "MOMENT_LOOKUP_FAILED" };
    }
    if (!moment) {
      return { success: false, error: "Moment not found.", code: "MOMENT_NOT_FOUND" };
    }

    if (liked) {
      const { error } = await supabase
        .from("likes")
        .upsert(
          { user_id: currentUser.id, moment_id: momentId },
          { onConflict: "user_id,moment_id", ignoreDuplicates: true },
        );
      if (error) {
        console.error("setMomentLike insert failed", error);
        return { success: false, error: "Likeに失敗しました。", code: "LIKE_FAILED" };
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("moment_id", momentId);
      if (error) {
        console.error("setMomentLike delete failed", error);
        return { success: false, error: "Unlikeに失敗しました。", code: "UNLIKE_FAILED" };
      }
    }

    revalidatePath(`/moment/${momentId}`);
    return { success: true, data: { liked } };
  } catch (error) {
    console.error("setMomentLike unexpected failure", error);
    return { success: false, error: "Likeの更新に失敗しました。", code: "LIKE_FAILED" };
  }
}

export async function addComment(momentId: string, body: string): Promise<ActionResult> {
  if (!momentId || !/^[0-9a-f-]{36}$/i.test(momentId)) {
    return { success: false, error: "Invalid Moment.", code: "INVALID_MOMENT_ID" };
  }

  const clean = body.trim();
  if (!clean || clean.length > 500) {
    return { success: false, error: "Comment must be 1–500 characters.", code: "INVALID_INPUT" };
  }

  try {
    const { supabase, currentUser, error: authError } = await getCurrentUser();
    if (authError || !currentUser) {
      return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    }
    const { error } = await supabase.from("comments").insert({ user_id: currentUser.id, moment_id: momentId, body: clean });
    if (error) {
      console.error("addComment insert failed", error);
      return { success: false, error: "コメントの投稿に失敗しました。", code: "COMMENT_FAILED" };
    }
    revalidatePath(`/moment/${momentId}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("addComment unexpected failure", error);
    return { success: false, error: "コメントの投稿に失敗しました。", code: "COMMENT_FAILED" };
  }
}

export async function toggleFollow(targetProfileId: string): Promise<ActionResult<{ following: boolean }>> {
  if (!targetProfileId || !/^[0-9a-f-]{36}$/i.test(targetProfileId)) {
    return { success: false, error: "Invalid profile.", code: "INVALID_PROFILE_ID" };
  }

  try {
    const { supabase, currentUser, error: authError } = await getCurrentUser();
    if (authError || !currentUser) {
      return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    }
    if (currentUser.id === targetProfileId) {
      return { success: false, error: "You cannot follow yourself.", code: "SELF_FOLLOW" };
    }

    const { data: existing, error: lookupError } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetProfileId)
      .maybeSingle();
    if (lookupError) {
      console.error("toggleFollow lookup failed", lookupError);
      return { success: false, error: "Follow状態を確認できませんでした。", code: "FOLLOW_LOOKUP_FAILED" };
    }

    if (existing) {
      const { error } = await supabase.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", targetProfileId);
      if (error) {
        console.error("toggleFollow delete failed", error);
        return { success: false, error: "Unfollowに失敗しました。", code: "UNFOLLOW_FAILED" };
      }
      return { success: true, data: { following: false } };
    }

    const { error } = await supabase.from("follows").insert({ follower_id: currentUser.id, following_id: targetProfileId });
    if (error) {
      console.error("toggleFollow insert failed", error);
      return { success: false, error: "Followに失敗しました。", code: "FOLLOW_FAILED" };
    }
    return { success: true, data: { following: true } };
  } catch (error) {
    console.error("toggleFollow unexpected failure", error);
    return { success: false, error: "Followの更新に失敗しました。", code: "FOLLOW_FAILED" };
  }
}

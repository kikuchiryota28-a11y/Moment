"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action";
import type { ThemePreference, Visibility } from "@/types/database";

export interface SettingsInput {
  theme: ThemePreference;
  notificationsEnabled: boolean;
  tryNotifications: boolean;
  reminderNotifications: boolean;
  activityVisibility: Visibility;
  experienceVisibility: Visibility;
}

const THEMES = new Set<ThemePreference>(["system", "light", "dark"]);
const VISIBILITIES = new Set<Visibility>(["public", "private"]);

export async function updateSettings(input: SettingsInput): Promise<ActionResult<undefined>> {
  if (!THEMES.has(input.theme) || !VISIBILITIES.has(input.activityVisibility) || !VISIBILITIES.has(input.experienceVisibility)) {
    return { success: false, error: "Invalid settings.", code: "VALIDATION_FAILED" };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };

    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      theme: input.theme,
      notifications_enabled: input.notificationsEnabled,
      try_notifications: input.tryNotifications,
      reminder_notifications: input.reminderNotifications,
      activity_visibility: input.activityVisibility,
      experience_visibility: input.experienceVisibility,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (error) {
      console.error("updateSettings failed", error);
      return { success: false, error: "Settings could not be saved.", code: "SETTINGS_UPDATE_FAILED" };
    }

    revalidatePath("/settings");
    revalidatePath("/profile/me");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateSettings unexpected failure", error);
    return { success: false, error: "Settings could not be saved.", code: "SETTINGS_UPDATE_FAILED" };
  }
}

export async function updateEmail(email: string): Promise<ActionResult<undefined>> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return { success: false, error: "Enter a valid email address.", code: "INVALID_EMAIL" };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    const { error } = await supabase.auth.updateUser({ email: normalized });
    if (error) return { success: false, error: error.message, code: "EMAIL_UPDATE_FAILED" };
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateEmail failed", error);
    return { success: false, error: "Email could not be updated.", code: "EMAIL_UPDATE_FAILED" };
  }
}

export async function updatePassword(password: string): Promise<ActionResult<undefined>> {
  if (password.length < 8) return { success: false, error: "Password must be at least 8 characters.", code: "INVALID_PASSWORD" };
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message, code: "PASSWORD_UPDATE_FAILED" };
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updatePassword failed", error);
    return { success: false, error: "Password could not be updated.", code: "PASSWORD_UPDATE_FAILED" };
  }
}

function storagePath(url: string | null, bucket: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null;
}

export async function deleteAccount(): Promise<ActionResult<undefined>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };

    const [{ data: profile }, { data: moments }] = await Promise.all([
      supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle(),
      supabase.from("moments").select("id").eq("user_id", user.id),
    ]);

    const momentIds = (moments ?? []).map((moment) => moment.id);
    if (momentIds.length) {
      const { data: media } = await supabase.from("moment_media").select("media_url").in("moment_id", momentIds);
      const paths = (media ?? []).map((row) => storagePath(row.media_url, "moment-media")).filter((path): path is string => Boolean(path));
      if (paths.length) {
        const { error } = await supabase.storage.from("moment-media").remove(paths);
        if (error) console.error("deleteAccount moment media cleanup failed", error);
      }
    }

    const avatarPath = storagePath(profile?.avatar_url ?? null, "avatars");
    if (avatarPath) {
      const { error } = await supabase.storage.from("avatars").remove([avatarPath]);
      if (error) console.error("deleteAccount avatar cleanup failed", error);
    }

    const { error: deleteError } = await supabase.rpc("delete_my_account");
    if (deleteError) {
      console.error("deleteAccount database deletion failed", deleteError);
      return { success: false, error: "Account could not be deleted.", code: "ACCOUNT_DELETE_FAILED" };
    }

    await supabase.auth.signOut();
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteAccount unexpected failure", error);
    return { success: false, error: "Account could not be deleted.", code: "ACCOUNT_DELETE_FAILED" };
  }
}

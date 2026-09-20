"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action";

export async function signIn(formData: FormData): Promise<ActionResult<void>> {
  const sb = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message, code: "AUTH_FAILED" };
  return { success: true };
}

export async function signUp(formData: FormData): Promise<ActionResult<void>> {
  const sb = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "");
  const username = String(formData.get("username") ?? "");

  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message, code: "AUTH_FAILED" };

  if (data.user) {
    const { error: profileError } = await sb.from("profiles").insert({
      id: data.user.id,
      username,
      display_name: displayName || username,
    });
    if (profileError) return { success: false, error: profileError.message, code: "PROFILE_FAILED" };

    const { error: settingsError } = await sb.from("user_settings").insert({
      user_id: data.user.id,
      theme: "system",
      notifications_enabled: true,
      try_notifications: true,
      reminder_notifications: true,
      activity_visibility: "public",
      experience_visibility: "public",
    });
    if (settingsError) return { success: false, error: settingsError.message, code: "SETTINGS_FAILED" };
  }

  return { success: true };
}

export async function signOut(): Promise<ActionResult<void>> {
  const sb = await createClient();
  const { error } = await sb.auth.signOut();
  if (error) return { success: false, error: error.message, code: "SIGNOUT_FAILED" };
  return { success: true };
}
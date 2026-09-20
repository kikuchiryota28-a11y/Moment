"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action";
import type { ThemePreference, Visibility } from "@/types/database";

export interface UpdateSettingsInput {
  theme?: ThemePreference;
  notificationsEnabled?: boolean;
  tryNotifications?: boolean;
  reminderNotifications?: boolean;
  activityVisibility?: Visibility;
  experienceVisibility?: Visibility;
}

export async function updateSettings(input: UpdateSettingsInput): Promise<ActionResult<void>> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };

  const updates: Record<string, any> = {};
  if (input.theme !== undefined) updates.theme = input.theme;
  if (input.notificationsEnabled !== undefined) updates.notifications_enabled = input.notificationsEnabled;
  if (input.tryNotifications !== undefined) updates.try_notifications = input.tryNotifications;
  if (input.reminderNotifications !== undefined) updates.reminder_notifications = input.reminderNotifications;
  if (input.activityVisibility !== undefined) updates.activity_visibility = input.activityVisibility;
  if (input.experienceVisibility !== undefined) updates.experience_visibility = input.experienceVisibility;

  const { error } = await sb.from("user_settings").upsert({ user_id: user.id, ...updates });
  if (error) return { success: false, error: error.message, code: "SETTINGS_UPDATE_FAILED" };

  return { success: true };
}

export async function updateEmail(email: string): Promise<ActionResult<void>> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };

  const { error } = await sb.auth.updateUser({ email });
  if (error) return { success: false, error: error.message, code: "EMAIL_UPDATE_FAILED" };

  return { success: true };
}

export async function updatePassword(password: string): Promise<ActionResult<void>> {
  if (password.length < 8) return { success: false, error: "Password must be at least 8 characters.", code: "PASSWORD_TOO_SHORT" };

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };

  const { error } = await sb.auth.updateUser({ password });
  if (error) return { success: false, error: error.message, code: "PASSWORD_UPDATE_FAILED" };

  return { success: true };
}

export async function deleteAccount(): Promise<ActionResult<void>> {
  const sb = await createClient();
  const { error } = await sb.rpc("delete_my_account");
  if (error) return { success: false, error: error.message, code: "DELETE_FAILED" };
  return { success: true };
}
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { ThemePreference, Visibility } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: settings } = await supabase.from("user_settings").select("theme,notifications_enabled,try_notifications,reminder_notifications,activity_visibility,experience_visibility").eq("user_id", user.id).maybeSingle();
  const initial = {
    theme: (settings?.theme ?? "system") as ThemePreference,
    notificationsEnabled: settings?.notifications_enabled ?? true,
    tryNotifications: settings?.try_notifications ?? true,
    reminderNotifications: settings?.reminder_notifications ?? true,
    activityVisibility: (settings?.activity_visibility ?? "public") as Visibility,
    experienceVisibility: (settings?.experience_visibility ?? "public") as Visibility,
  };
  return <ThemeProvider initialTheme={initial.theme}><SettingsPanel initial={initial} email={user.email ?? ""}/></ThemeProvider>;
}

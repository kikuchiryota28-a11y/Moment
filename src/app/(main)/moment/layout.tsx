import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import type { ThemePreference } from "@/types/database";

export default async function MomentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase.from("user_settings").select("theme").eq("user_id", user.id).maybeSingle();
  const theme = (settings?.theme ?? "system") as ThemePreference;

  return (
    <ThemeProvider initialTheme={theme}>
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}
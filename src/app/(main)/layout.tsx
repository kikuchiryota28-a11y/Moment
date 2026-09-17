import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Ambient3DCanvas } from "@/components/v3/Ambient3DCanvas";
import type { ThemePreference } from "@/types/database";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: settings } = await supabase.from("user_settings").select("theme").eq("user_id", user.id).maybeSingle();
  const theme = (settings?.theme ?? "system") as ThemePreference;

  return (
    <ThemeProvider initialTheme={theme}>
      <Ambient3DCanvas />
      <div className="relative z-10 min-h-screen">
        <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-28 sm:px-6">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </ThemeProvider>
  );
}

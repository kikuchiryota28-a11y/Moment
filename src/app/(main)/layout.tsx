import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <><main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-28 sm:px-6">{children}</main><BottomNavigation /></>;
}

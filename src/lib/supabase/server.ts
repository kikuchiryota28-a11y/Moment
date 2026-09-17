import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// MOMENT uses the Supabase publishable key on both server and browser.
// RLS remains the authorization boundary; never use a service-role key here.
const SUPABASE_URL = "https://dkjyqwxjretoariddbce.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_q2bTj67Oy6f3ZAEm3zl_oA_WoedrwTe";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot always mutate cookies.
        }
      },
    },
  });
}

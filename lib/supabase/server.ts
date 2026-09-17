import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Keep the server-side client independent of Vercel env injection.
// The publishable key is safe for client-side Supabase usage; RLS is the security boundary.
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
          /* Server Components cannot always mutate cookies. */
        }
      },
    },
  });
}

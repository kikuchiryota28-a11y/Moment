import {
  createServerClient,
  type CookieMethodsServer,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const cookies: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet, headers) {
      cookiesToSet.forEach(({ name, value, options }) => {
        request.cookies.set(name, value);
        supabaseResponse.cookies.set(name, value, options);
      });

      Object.entries(headers).forEach(([key, value]) => {
        supabaseResponse.headers.set(key, value);
      });
    },
  };

  try {
    const { url, key } = getSupabaseConfig();

    if (!url || !key) {
      return supabaseResponse;
    }

    const supabase = createServerClient(url, key, { cookies });
    await supabase.auth.getClaims();
  } catch (error) {
    // Auth refresh must never take the whole application down.
    // If Supabase configuration or auth is temporarily unavailable,
    // continue the request and let the page handle its own data state.
    console.error("[MOMENT] Supabase middleware skipped:", error);
  }

  return supabaseResponse;
}

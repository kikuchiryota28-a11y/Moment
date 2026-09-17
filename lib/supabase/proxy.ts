import {
  createServerClient,
  type CookieMethodsServer,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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

  const { url, key } = getSupabaseConfig();
  const supabase = createServerClient(url, key, { cookies });

  await supabase.auth.getClaims();
  return supabaseResponse;
}

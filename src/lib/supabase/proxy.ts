import {
  createServerClient,
  type CookieMethodsServer,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies },
  );

  await supabase.auth.getClaims();
  return supabaseResponse;
}

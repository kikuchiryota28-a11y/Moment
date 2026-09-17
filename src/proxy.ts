import { NextResponse, type NextRequest } from "next/server";

/**
 * Keep the Next.js proxy dependency-free.
 * Supabase auth/session work must not run from this serverless middleware
 * entrypoint, so a missing runtime Supabase configuration can never prevent
 * the public app shell from rendering.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

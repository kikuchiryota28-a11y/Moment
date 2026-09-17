import { NextResponse, type NextRequest } from "next/server";

// The active Next.js proxy intentionally does not initialize Supabase.
// Authentication/session work is handled by the server client where needed.
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}

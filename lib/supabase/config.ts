const SUPABASE_URL = "https://dkjyqwxjretoariddbce.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_q2bTj67Oy6f3ZAEm3zl_oA_WoedrwTe";

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    SUPABASE_PUBLISHABLE_KEY;

  return { url, key };
}

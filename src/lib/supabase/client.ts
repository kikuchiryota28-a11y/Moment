import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "https://dkjyqwxjretoariddbce.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_q2bTj67Oy6f3ZAEm3zl_oA_WoedrwTe";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

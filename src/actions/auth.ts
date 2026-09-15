"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  if (!email || password.length < 8 || !/^[a-z0-9_]{3,24}$/.test(username) || !displayName) return { ok: false as const, error: "Enter a valid username, display name, email, and password (8+ characters)." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, display_name: displayName } } });
  if (error || !data.user) return { ok: false as const, error: error?.message ?? "Could not create account." };
  if (!data.session) redirect("/login?message=Check%20your%20email%20to%20finish%20sign%20up");
  redirect("/");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false as const, error: error.message };
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const sb = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/");
}

export async function signUp(formData: FormData) {
  const sb = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "");
  const username = String(formData.get("username") ?? "");

  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);

  if (data.user) {
    const { error: profileError } = await sb.from("profiles").insert({
      id: data.user.id,
      username,
      display_name: displayName || username,
    });
    if (profileError) redirect(`/signup?error=${encodeURIComponent(profileError.message)}`);

    await sb.from("user_settings").insert({
      user_id: data.user.id,
      theme: "system",
      notifications_enabled: true,
      try_notifications: true,
      reminder_notifications: true,
      activity_visibility: "public",
      experience_visibility: "public",
    });
  }

  redirect("/");
}

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/login");
}
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("id,username,display_name,avatar_url,bio,website_url,instagram_url,x_url,created_at,updated_at").eq("id", user.id).single();
  if (!profile) redirect("/profile/me");
  return <ProfileForm profile={{ id: profile.id, username: profile.username, displayName: profile.display_name, avatarUrl: profile.avatar_url, bio: profile.bio, websiteUrl: profile.website_url, instagramUrl: profile.instagram_url, xUrl: profile.x_url, createdAt: profile.created_at, updatedAt: profile.updated_at }} />;
}

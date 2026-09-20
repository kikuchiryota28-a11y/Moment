"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/shared/Avatar";
import { useToast } from "@/components/ui/Toast";

export default function ProfileEditPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    website_url: "",
    instagram_url: "",
    x_url: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  async function loadProfile() {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (profile) {
      setFormData({
        display_name: profile.display_name,
        username: profile.username,
        bio: profile.bio || "",
        website_url: profile.website_url || "",
        instagram_url: profile.instagram_url || "",
        x_url: profile.x_url || "",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }

  async function uploadAvatar(file: File) {
    const isImage = file.type.startsWith("image/");
    if (!isImage || file.size > 5 * 1024 * 1024) {
      addToast({ message: "Use an image up to 5MB.", type: "error" });
      return;
    }
    setLoading(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `${user.id}/avatar-${crypto.randomUUID()}-${safeName}`;
    const { error } = await sb.storage.from("moment-media").upload(path, file, { contentType: file.type, upsert: true });
    if (error) { addToast({ message: error.message, type: "error" }); setLoading(false); return; }
    const { data: { publicUrl } } = sb.storage.from("moment-media").getPublicUrl(path);
    setAvatarUrl(publicUrl);
    setLoading(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      await uploadAvatar(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;

    const { error } = await sb.from("profiles").upsert({ id: user.id, ...formData, avatar_url: avatarUrl });
    if (error) { addToast({ message: error.message, type: "error" }); setLoading(false); return; }
    addToast({ message: "Profile updated.", type: "success" });
    setLoading(false);
    router.push("/profile/me");
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12 lg:py-16">
      <div className="mb-8">
        <Badge variant="accent" className="mb-2">Control</Badge>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Edit profile</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <Card variant="default" className="p-6 lg:sticky lg:top-24">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar src={avatarPreview || avatarUrl} name={formData.display_name || "You"} size={96} />
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-[var(--color-ink)] text-[var(--color-overlay)] hover:bg-[var(--color-ink)]/90 transition-colors cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 4.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </label>
            </div>
            <div className="w-full">
              <Input
                label="Display name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
                disabled={loading}
              />
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@username"
                required
                disabled={loading}
              />
            </div>
          </div>
        </Card>

        <Card variant="default" className="p-6">
          <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-6">About</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <Input
              label="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="A short description"
              maxLength={160}
              disabled={loading}
            />
            <Input
              label="Website"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://example.com"
              disabled={loading}
            />
            <Input
              label="Instagram"
              value={formData.instagram_url}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              placeholder="https://instagram.com/username"
              disabled={loading}
            />
            <Input
              label="X (Twitter)"
              value={formData.x_url}
              onChange={(e) => setFormData({ ...formData, x_url: e.target.value })}
              placeholder="https://x.com/username"
              disabled={loading}
            />
            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading} size="lg">Save changes</Button>
              <Button type="button" variant="ghost" onClick={() => router.back()} size="lg">Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
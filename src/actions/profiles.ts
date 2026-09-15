"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/action";
import { validateProfileInput, type ProfileInput } from "@/lib/validation/profile";

function avatarPathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = "/storage/v1/object/public/avatars/";
  const index = url.indexOf(marker);
  return index >= 0 ? decodeURIComponent(url.slice(index + marker.length)) : null;
}

export async function updateProfile(input: ProfileInput): Promise<ActionResult<{ username: string }>> {
  const errors = validateProfileInput(input);
  if (Object.keys(errors).length) {
    return { success: false, error: Object.values(errors)[0] ?? "Invalid profile.", code: "VALIDATION_FAILED" };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };

    const username = input.username.trim().toLowerCase();
    const { data: existing, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .neq("id", user.id)
      .maybeSingle();
    if (lookupError) {
      console.error("updateProfile username lookup failed", lookupError);
      return { success: false, error: "Username could not be checked.", code: "USERNAME_LOOKUP_FAILED" };
    }
    if (existing) return { success: false, error: "That username is already taken.", code: "USERNAME_TAKEN" };

    const { error } = await supabase.from("profiles").update({
      display_name: input.displayName.trim(),
      username,
      bio: input.bio.trim() || null,
      website_url: input.websiteUrl.trim() || null,
      instagram_url: input.instagramUrl.trim() || null,
      x_url: input.xUrl.trim() || null,
    }).eq("id", user.id);

    if (error) {
      console.error("updateProfile failed", error);
      if (error.code === "23505") return { success: false, error: "That username is already taken.", code: "USERNAME_TAKEN" };
      return { success: false, error: "Profile could not be saved.", code: "PROFILE_UPDATE_FAILED" };
    }

    revalidatePath(`/profile/${username}`);
    revalidatePath("/profile/me");
    revalidatePath("/profile/edit");
    return { success: true, data: { username } };
  } catch (error) {
    console.error("updateProfile unexpected failure", error);
    return { success: false, error: "Profile could not be saved.", code: "PROFILE_UPDATE_FAILED" };
  }
}

const AVATAR_LIMIT = 5 * 1024 * 1024;
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function hasValidImageSignature(bytes: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.slice(0, 8).every((v, i) => v === [137, 80, 78, 71, 13, 10, 26, 10][i]);
  if (type === "image/webp") return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ avatarUrl: string }>> {
  const file = formData.get("avatar");
  if (!(file instanceof File)) return { success: false, error: "Choose an image first.", code: "FILE_REQUIRED" };
  if (!AVATAR_TYPES.has(file.type)) return { success: false, error: "Use JPEG, PNG, or WebP.", code: "INVALID_FILE_TYPE" };
  if (file.size <= 0 || file.size > AVATAR_LIMIT) return { success: false, error: "Avatar must be 5MB or smaller.", code: "FILE_TOO_LARGE" };

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Authentication required.", code: "AUTH_REQUIRED" };

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidImageSignature(bytes, file.type)) return { success: false, error: "The selected file is not a valid image.", code: "INVALID_IMAGE" };

    const { data: profile, error: profileError } = await supabase.from("profiles").select("avatar_url, username").eq("id", user.id).single();
    if (profileError || !profile) return { success: false, error: "Profile could not be loaded.", code: "PROFILE_LOOKUP_FAILED" };

    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const path = `${user.id}/avatar-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
    if (uploadError) {
      console.error("uploadAvatar storage upload failed", uploadError);
      return { success: false, error: "Avatar upload failed.", code: "AVATAR_UPLOAD_FAILED" };
    }

    const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl.publicUrl }).eq("id", user.id);
    if (updateError) {
      await supabase.storage.from("avatars").remove([path]);
      console.error("uploadAvatar profile update failed", updateError);
      return { success: false, error: "Avatar could not be attached to your profile.", code: "AVATAR_PROFILE_UPDATE_FAILED" };
    }

    const oldPath = avatarPathFromUrl(profile.avatar_url);
    if (oldPath) {
      const { error: removeError } = await supabase.storage.from("avatars").remove([oldPath]);
      if (removeError) console.error("uploadAvatar old avatar cleanup failed", removeError);
    }

    revalidatePath(`/profile/${profile.username}`);
    revalidatePath("/profile/me");
    revalidatePath("/profile/edit");
    return { success: true, data: { avatarUrl: publicUrl.publicUrl } };
  } catch (error) {
    console.error("uploadAvatar unexpected failure", error);
    return { success: false, error: "Avatar upload failed.", code: "AVATAR_UPLOAD_FAILED" };
  }
}

export interface ProfileInput {
  displayName: string;
  username: string;
  bio: string;
  websiteUrl: string;
  instagramUrl: string;
  xUrl: string;
}

export interface ProfileFieldErrors {
  displayName?: string;
  username?: string;
  bio?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function parseOptionalUrl(value: string, label: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return `${label} must use http or https.`;
    return undefined;
  } catch {
    return `${label} must be a valid URL.`;
  }
}

export function validateProfileInput(input: ProfileInput): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  const displayName = input.displayName.trim();
  const username = input.username.trim();
  const bio = input.bio.trim();

  if (!displayName || displayName.length > 60) errors.displayName = "Display name must be 1–60 characters.";
  if (!USERNAME_RE.test(username)) errors.username = "Username must be 3–20 letters, numbers, or underscores.";
  if (bio.length > 500) errors.bio = "Bio must be 500 characters or fewer.";

  errors.websiteUrl = parseOptionalUrl(input.websiteUrl.trim(), "Website");
  errors.instagramUrl = parseOptionalUrl(input.instagramUrl.trim(), "Instagram");
  errors.xUrl = parseOptionalUrl(input.xUrl.trim(), "X");

  for (const key of Object.keys(errors) as (keyof ProfileFieldErrors)[]) {
    if (!errors[key]) delete errors[key];
  }
  return errors;
}

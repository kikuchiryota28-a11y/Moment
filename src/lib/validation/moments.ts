import type { MomentCategory } from "@/types/moment";

const categories: MomentCategory[] = ["explore", "eat", "watch", "move", "create", "social", "travel"];

export type CreateMomentInput = {
  title: string;
  description: string;
  why?: string;
  category: string;
  media: { url: string; type?: "image" | "video" }[];
  location?: string;
  durationMinutes?: number;
  estimatedCost?: number;
  rating: number;
  wouldDoAgain: boolean;
};

export function validateCreateMoment(input: CreateMomentInput) {
  const errors: Record<string, string> = {};
  if (input.title.trim().length < 2 || input.title.trim().length > 80) errors.title = "Title must be 2–80 characters.";
  if (input.description.trim().length < 10 || input.description.trim().length > 1000) errors.description = "Description must be 10–1000 characters.";
  if (!categories.includes(input.category as MomentCategory)) errors.category = "Choose a valid category.";
  if (!input.media.length) errors.media = "Add at least one image.";
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) errors.rating = "Rating must be between 1 and 5.";
  if (typeof input.wouldDoAgain !== "boolean") errors.wouldDoAgain = "Choose Yes or No.";
  return errors;
}

import type { MomentCategory } from "@/types/moment";

const categories: MomentCategory[] = ["explore", "eat", "watch", "move", "create", "social", "travel"];

export type MomentFormInput = {
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
  experienceNote?: string;
};

export type CreateMomentInput = MomentFormInput;
export type UpdateMomentInput = MomentFormInput & { momentId: string };

export function validateMomentInput(input: MomentFormInput) {
  const errors: Record<string, string> = {};
  if (input.title.trim().length < 2 || input.title.trim().length > 80) errors.title = "Title must be 2–80 characters.";
  if (input.description.trim().length < 10 || input.description.trim().length > 1000) errors.description = "Description must be 10–1000 characters.";
  if (input.why && input.why.trim().length > 500) errors.why = "Why must be 500 characters or fewer.";
  if (!categories.includes(input.category as MomentCategory)) errors.category = "Choose a valid category.";
  if (!input.media.length) errors.media = "Add at least one image.";
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) errors.rating = "Rating must be between 1 and 5.";
  if (typeof input.wouldDoAgain !== "boolean") errors.wouldDoAgain = "Choose Yes or No.";
  if (input.location && input.location.trim().length > 160) errors.location = "Location must be 160 characters or fewer.";
  if (input.durationMinutes !== undefined && (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0)) errors.durationMinutes = "Duration must be a positive whole number.";
  if (input.estimatedCost !== undefined && (!Number.isInteger(input.estimatedCost) || input.estimatedCost < 0)) errors.estimatedCost = "Cost must be a non-negative whole number.";
  if (input.experienceNote && input.experienceNote.trim().length > 1000) errors.experienceNote = "Experience note must be 1000 characters or fewer.";
  return errors;
}

export const validateCreateMoment = validateMomentInput;

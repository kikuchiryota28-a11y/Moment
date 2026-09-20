import type { MomentCategory } from "@/types/moment";

export const CATEGORIES: { value: MomentCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "explore", label: "Explore" },
  { value: "eat", label: "Eat" },
  { value: "watch", label: "Watch" },
  { value: "move", label: "Move" },
  { value: "create", label: "Create" },
  { value: "social", label: "Social" },
  { value: "travel", label: "Travel" },
];

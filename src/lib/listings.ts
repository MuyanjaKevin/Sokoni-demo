import type { ListingCondition } from "@/types";

export const LISTING_CATEGORIES = [
  { id: "all", label: "All", icon: "layout-grid" },
  { id: "fashion", label: "Fashion", icon: "shirt" },
  { id: "electronics", label: "Electronics", icon: "smartphone" },
  { id: "gaming", label: "Gaming", icon: "gamepad-2" },
] as const;

export type ListingCategoryId =
  | (typeof LISTING_CATEGORIES)[number]["id"]
  | string;

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

export function formatCondition(condition: ListingCondition): string {
  return CONDITION_LABELS[condition];
}

export interface ListingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  district?: string;
}

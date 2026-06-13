import type { ProfileTier } from "@/types";

/** Hustle points thresholds for seller tiers. */
export function tierFromHustlePoints(points: number): ProfileTier {
  if (points >= 500) return "legend";
  if (points >= 300) return "elite";
  if (points >= 150) return "grinder";
  if (points >= 50) return "mover";
  return "hustler";
}

export const HUSTLE_POINTS_PER_RATING = 10;

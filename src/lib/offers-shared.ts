import type { Offer } from "@/types";

/** Safe for client components — no server/env imports. */
export const MAX_OFFER_ROUNDS = 5;

export interface OfferWithBuyer extends Offer {
  buyer: {
    id: string;
    display_name: string;
    avg_rating: number;
  } | null;
  transaction: { id: string } | null;
}

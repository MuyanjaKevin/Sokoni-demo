import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import {
  MAX_OFFER_ROUNDS,
  canTransitionOffer,
  createTransactionFromAcceptedOffer,
  isOfferExpired,
} from "@/lib/offers";
import { createCookieClient } from "@/lib/supabase/cookie";
import { createServerClient } from "@/lib/supabase/server";

const actionSchema = z.object({
  action: z.enum(["accept", "counter", "decline"]),
  proposed_price: z.number().int().positive().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
): Promise<Response> {
  try {
    const cookieClient = createCookieClient();
    const {
      data: { user },
      error: userError,
    } = await cookieClient.auth.getUser();

    if (userError || !user) {
      return jsonError("You must be signed in", 401);
    }

    const body: unknown = await request.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid action");
    }

    const { action, proposed_price: proposedPrice } = parsed.data;
    const admin = createServerClient();

    const { data: offer, error: offerError } = await admin
      .from("offers")
      .select(
        `
        *,
        listing:listings!listing_id (
          id,
          seller_id,
          title,
          status
        )
      `,
      )
      .eq("id", context.params.id)
      .maybeSingle();

    if (offerError || !offer) {
      return jsonError("Offer not found", 404);
    }

    const listingRaw = offer.listing as
      | {
          id: string;
          seller_id: string;
          title: string;
          status: string;
        }
      | {
          id: string;
          seller_id: string;
          title: string;
          status: string;
        }[]
      | null;

    const listing = Array.isArray(listingRaw) ? listingRaw[0] : listingRaw;

    if (!listing || listing.status !== "active") {
      return jsonError("Listing is no longer available");
    }

    if (isOfferExpired(offer)) {
      await admin
        .from("offers")
        .update({ status: "expired" })
        .eq("id", offer.id);
      return jsonError("This offer has expired");
    }

    if (!["pending", "countered"].includes(offer.status)) {
      return jsonError("This offer can no longer be updated");
    }

    const sellerId = listing.seller_id;
    const buyerId = offer.buyer_id as string;

    if (
      !canTransitionOffer(
        offer.status,
        action,
        user.id,
        buyerId,
        sellerId,
      )
    ) {
      return jsonError("You are not allowed to perform this action");
    }

    if (action === "decline") {
      const { error } = await admin
        .from("offers")
        .update({ status: "declined" })
        .eq("id", offer.id);

      if (error) {
        return jsonError("Could not decline offer", 500);
      }

      return jsonSuccess({ status: "declined" });
    }

    if (action === "accept") {
      const { error: acceptError } = await admin
        .from("offers")
        .update({ status: "accepted" })
        .eq("id", offer.id);

      if (acceptError) {
        return jsonError("Could not accept offer", 500);
      }

      const transactionId = await createTransactionFromAcceptedOffer(
        offer,
        sellerId,
      );

      return jsonSuccess({
        status: "accepted",
        transaction_id: transactionId,
      });
    }

    if (!proposedPrice) {
      return jsonError("Counter offer requires a price");
    }

    if (offer.round >= MAX_OFFER_ROUNDS) {
      return jsonError("Maximum negotiation rounds (5) reached");
    }

    const { error: counterError } = await admin
      .from("offers")
      .update({
        proposed_price: proposedPrice,
        status: "countered",
        round: offer.round + 1,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", offer.id);

    if (counterError) {
      return jsonError("Could not send counter offer", 500);
    }

    return jsonSuccess({ status: "countered", round: offer.round + 1 });
  } catch {
    return jsonError("Something went wrong", 500);
  }
}

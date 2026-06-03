import { MAX_OFFER_ROUNDS, type OfferWithBuyer } from "@/lib/offers-shared";
import { createServerClient } from "@/lib/supabase/server";
import type { Offer, OfferStatus } from "@/types";

export { MAX_OFFER_ROUNDS, type OfferWithBuyer };

export async function fetchOffersForListing(
  listingId: string,
): Promise<OfferWithBuyer[]> {
  const admin = createServerClient();
  const { data, error } = await admin
    .from("offers")
    .select(
      `
      *,
      buyer:profiles!buyer_id (
        id,
        display_name,
        avg_rating
      ),
      transaction:transactions!offer_id (
        id
      )
    `,
    )
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OfferWithBuyer[];
}

export async function createTransactionFromAcceptedOffer(
  offer: Offer,
  sellerId: string,
): Promise<string> {
  const admin = createServerClient();

  const { data: transaction, error: transactionError } = await admin
    .from("transactions")
    .insert({
      listing_id: offer.listing_id,
      offer_id: offer.id,
      buyer_id: offer.buyer_id,
      seller_id: sellerId,
      agreed_price: offer.proposed_price,
      status: "pending",
    })
    .select("id")
    .single();

  if (transactionError || !transaction) {
    throw new Error("Could not create transaction");
  }

  const { error: escrowError } = await admin.from("escrow").insert({
    transaction_id: transaction.id,
    amount: offer.proposed_price,
    state: "pending",
  });

  if (escrowError) {
    throw new Error("Could not create escrow record");
  }

  await admin
    .from("listings")
    .update({ status: "sold" })
    .eq("id", offer.listing_id);

  return transaction.id as string;
}

export function isOfferExpired(offer: Offer): boolean {
  return new Date(offer.expires_at).getTime() < Date.now();
}

export function canTransitionOffer(
  status: OfferStatus,
  action: "accept" | "counter" | "decline",
  userId: string,
  buyerId: string,
  sellerId: string,
): boolean {
  if (action === "accept") {
    return (
      (status === "pending" && userId === sellerId) ||
      (status === "countered" && userId === buyerId)
    );
  }

  if (action === "counter") {
    return (
      (status === "pending" && userId === sellerId) ||
      (status === "countered" && userId === buyerId)
    );
  }

  if (action === "decline") {
    return (
      (status === "pending" && userId === sellerId) ||
      (status === "countered" && userId === buyerId) ||
      (status === "pending" && userId === buyerId)
    );
  }

  return false;
}

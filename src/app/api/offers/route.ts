import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { fetchOffersForListing } from "@/lib/offers";
import { createCookieClient } from "@/lib/supabase/cookie";
import { resolveProfileForUser } from "@/lib/profile-user";
import { createServerClient } from "@/lib/supabase/server";

const createOfferSchema = z.object({
  listing_id: z.string().uuid(),
  proposed_price: z.number().int().positive(),
});

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listing_id");

    if (!listingId) {
      return jsonError("listing_id is required");
    }

    const cookieClient = createCookieClient();
    const {
      data: { user },
    } = await cookieClient.auth.getUser();

    if (!user) {
      return jsonError("You must be signed in", 401);
    }

    const offers = await fetchOffersForListing(listingId);

    return jsonSuccess(offers);
  } catch {
    return jsonError("Could not load offers", 500);
  }
}

export async function POST(request: Request): Promise<Response> {
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
    const parsed = createOfferSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid offer. Price must be a positive number.");
    }

    const profile = await resolveProfileForUser(user);

    if (!profile) {
      return jsonError("Complete your profile before making offers", 400);
    }

    const admin = createServerClient();
    const { data: listing, error: listingError } = await admin
      .from("listings")
      .select("id, seller_id, status, asking_price")
      .eq("id", parsed.data.listing_id)
      .eq("status", "active")
      .is("deleted_at", null)
      .maybeSingle();

    if (listingError || !listing) {
      return jsonError("Listing not found or no longer available", 404);
    }

    if (listing.seller_id === profile.id) {
      return jsonError("You cannot make an offer on your own listing");
    }

    const { data: existing } = await admin
      .from("offers")
      .select("id")
      .eq("listing_id", parsed.data.listing_id)
      .eq("buyer_id", profile.id)
      .in("status", ["pending", "countered"])
      .limit(1);

    if (existing && existing.length > 0) {
      return jsonError(
        "You already have an active offer. Update it from the offer page.",
      );
    }

    const { data: offer, error: insertError } = await admin
      .from("offers")
      .insert({
        listing_id: parsed.data.listing_id,
        buyer_id: profile.id,
        proposed_price: parsed.data.proposed_price,
        status: "pending",
        round: 1,
      })
      .select("id")
      .single();

    if (insertError || !offer) {
      return jsonError("Could not send offer", 500);
    }

    return jsonSuccess({ id: offer.id }, 201);
  } catch {
    return jsonError("Something went wrong", 500);
  }
}

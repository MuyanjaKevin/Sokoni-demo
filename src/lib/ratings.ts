import { createServerClient } from "@/lib/supabase/server";
import { HUSTLE_POINTS_PER_RATING, tierFromHustlePoints } from "@/lib/tier";
import type { Rating } from "@/types";

export interface RatingWithRater extends Rating {
  rater: { id: string; display_name: string } | null;
}

export async function recalculateProfileRating(profileId: string): Promise<void> {
  const admin = createServerClient();

  const { data: ratings, error } = await admin
    .from("ratings")
    .select("stars")
    .eq("rated_id", profileId);

  if (error) {
    throw new Error("Could not load ratings");
  }

  const count = ratings?.length ?? 0;
  const avg =
    count === 0
      ? 0
      : (ratings ?? []).reduce((sum, row) => sum + row.stars, 0) / count;

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("hustle_points")
    .eq("id", profileId)
    .single();

  if (profileError || !profile) {
    throw new Error("Profile not found");
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      avg_rating: Math.round(avg * 100) / 100,
      rating_count: count,
      tier: tierFromHustlePoints(profile.hustle_points),
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (updateError) {
    throw new Error("Could not update profile rating");
  }
}

export async function createRating(params: {
  transactionId: string;
  raterId: string;
  stars: number;
  review?: string | null;
}): Promise<Rating> {
  const admin = createServerClient();

  const { data: transaction, error: txError } = await admin
    .from("transactions")
    .select("id, buyer_id, seller_id, status")
    .eq("id", params.transactionId)
    .maybeSingle();

  if (txError || !transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.status !== "completed") {
    throw new Error("You can only rate completed transactions");
  }

  const isBuyer = transaction.buyer_id === params.raterId;
  const isSeller = transaction.seller_id === params.raterId;

  if (!isBuyer && !isSeller) {
    throw new Error("You are not part of this transaction");
  }

  const ratedId = isBuyer ? transaction.seller_id : transaction.buyer_id;

  const { data: existing } = await admin
    .from("ratings")
    .select("id")
    .eq("transaction_id", params.transactionId)
    .eq("rater_id", params.raterId)
    .maybeSingle();

  if (existing) {
    throw new Error("You have already rated this transaction");
  }

  const { data: rating, error: insertError } = await admin
    .from("ratings")
    .insert({
      transaction_id: params.transactionId,
      rater_id: params.raterId,
      rated_id: ratedId,
      stars: params.stars,
      review: params.review?.trim() || null,
    })
    .select("*")
    .single();

  if (insertError || !rating) {
    throw new Error("Could not save rating");
  }

  const { data: ratedProfile } = await admin
    .from("profiles")
    .select("hustle_points")
    .eq("id", ratedId)
    .single();

  if (ratedProfile) {
    const newPoints = ratedProfile.hustle_points + HUSTLE_POINTS_PER_RATING;
    await admin
      .from("profiles")
      .update({
        hustle_points: newPoints,
        tier: tierFromHustlePoints(newPoints),
        updated_at: new Date().toISOString(),
      })
      .eq("id", ratedId);
  }

  await recalculateProfileRating(ratedId);

  return rating as Rating;
}

export async function fetchRatingsForProfile(
  profileId: string,
): Promise<RatingWithRater[]> {
  const admin = createServerClient();

  const { data, error } = await admin
    .from("ratings")
    .select(
      `
      *,
      rater:profiles!rater_id (
        id,
        display_name
      )
    `,
    )
    .eq("rated_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RatingWithRater[];
}

import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createRating } from "@/lib/ratings";
import { fetchRatingForTransaction } from "@/lib/profile-data";
import { createCookieClient } from "@/lib/supabase/cookie";

const querySchema = z.object({
  transaction_id: z.string().uuid(),
});

const createRatingSchema = z.object({
  transaction_id: z.string().uuid(),
  stars: z.number().int().min(1).max(5),
  review: z.string().trim().max(500).optional(),
});

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      transaction_id: searchParams.get("transaction_id"),
    });

    if (!parsed.success) {
      return jsonError("transaction_id is required");
    }

    const cookieClient = createCookieClient();
    const {
      data: { user },
    } = await cookieClient.auth.getUser();

    if (!user) {
      return jsonError("You must be signed in", 401);
    }

    const { rating, ratedProfile } = await fetchRatingForTransaction(
      parsed.data.transaction_id,
      user.id,
    );

    return jsonSuccess({ rating, ratedProfile });
  } catch {
    return jsonError("Something went wrong", 500);
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
    const parsed = createRatingSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Rating must be 1–5 stars with an optional review");
    }

    const rating = await createRating({
      transactionId: parsed.data.transaction_id,
      raterId: user.id,
      stars: parsed.data.stars,
      review: parsed.data.review,
    });

    return jsonSuccess(rating, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return jsonError(message, 400);
  }
}

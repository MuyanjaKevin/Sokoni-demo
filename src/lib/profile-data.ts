import { createPublicClient } from "@/lib/supabase/public";
import { createServerClient } from "@/lib/supabase/server";
import { fetchRatingsForProfile, type RatingWithRater } from "@/lib/ratings";
import type { Listing, Profile, Transaction } from "@/types";

export interface ProfileDetail extends Profile {
  active_listings_count: number;
  completed_sales_count: number;
}

export interface PurchaseRow extends Transaction {
  listing: Pick<Listing, "id" | "title" | "photo_urls" | "asking_price"> | null;
}

export interface InboxItem extends Transaction {
  listing: Pick<Listing, "id" | "title" | "photo_urls"> | null;
  counterparty: Pick<Profile, "id" | "display_name"> | null;
}

export async function fetchProfileById(id: string): Promise<Profile | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile | null;
}

export async function fetchProfileWithStats(
  id: string,
): Promise<ProfileDetail | null> {
  const profile = await fetchProfileById(id);
  if (!profile) {
    return null;
  }

  const admin = createServerClient();

  const [listingsRes, salesRes] = await Promise.all([
    admin
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", id)
      .eq("status", "active")
      .is("deleted_at", null),
    admin
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", id)
      .eq("status", "completed"),
  ]);

  return {
    ...profile,
    active_listings_count: listingsRes.count ?? 0,
    completed_sales_count: salesRes.count ?? 0,
  };
}

export async function fetchSellerListings(
  sellerId: string,
  options: { includeSold?: boolean } = {},
): Promise<Listing[]> {
  const admin = createServerClient();
  let query = admin
    .from("listings")
    .select("*")
    .eq("seller_id", sellerId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!options.includeSold) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Listing[];
}

export async function fetchUserPurchases(userId: string): Promise<PurchaseRow[]> {
  const admin = createServerClient();

  const { data, error } = await admin
    .from("transactions")
    .select(
      `
      *,
      listing:listings!listing_id (
        id,
        title,
        photo_urls,
        asking_price
      )
    `,
    )
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PurchaseRow[];
}

export async function fetchInboxForUser(userId: string): Promise<InboxItem[]> {
  const admin = createServerClient();

  const { data, error } = await admin
    .from("transactions")
    .select(
      `
      *,
      listing:listings!listing_id (
        id,
        title,
        photo_urls
      )
    `,
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .in("status", ["pending", "escrowed", "in_delivery"])
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as InboxItem[];
  const counterpartyIds = rows.map((row) =>
    row.buyer_id === userId ? row.seller_id : row.buyer_id,
  );

  if (counterpartyIds.length === 0) {
    return rows;
  }

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name")
    .in("id", counterpartyIds);

  const nameById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return rows.map((row) => ({
    ...row,
    counterparty:
      nameById.get(
        row.buyer_id === userId ? row.seller_id : row.buyer_id,
      ) ?? null,
  }));
}

export async function fetchProfileReviews(
  profileId: string,
): Promise<RatingWithRater[]> {
  return fetchRatingsForProfile(profileId);
}

export async function fetchRatingForTransaction(
  transactionId: string,
  raterId: string,
): Promise<{ rating: RatingWithRater | null; ratedProfile: Pick<Profile, "id" | "display_name"> | null }> {
  const admin = createServerClient();

  const { data: transaction } = await admin
    .from("transactions")
    .select("buyer_id, seller_id, status")
    .eq("id", transactionId)
    .maybeSingle();

  if (!transaction) {
    return { rating: null, ratedProfile: null };
  }

  const ratedId =
    transaction.buyer_id === raterId
      ? transaction.seller_id
      : transaction.seller_id === raterId
        ? transaction.buyer_id
        : null;

  if (!ratedId) {
    return { rating: null, ratedProfile: null };
  }

  const [{ data: rating }, { data: ratedProfile }] = await Promise.all([
    admin
      .from("ratings")
      .select("*")
      .eq("transaction_id", transactionId)
      .eq("rater_id", raterId)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("id, display_name")
      .eq("id", ratedId)
      .maybeSingle(),
  ]);

  return {
    rating: (rating as RatingWithRater | null) ?? null,
    ratedProfile: ratedProfile as Pick<Profile, "id" | "display_name"> | null,
  };
}

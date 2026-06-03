import { createPublicClient } from "@/lib/supabase/public";
import type { ListingFilters } from "@/lib/listings";
import type { Listing, Profile } from "@/types";

export interface ListingWithSeller extends Listing {
  seller: Pick<
    Profile,
    "id" | "display_name" | "avg_rating" | "rating_count" | "district" | "tier"
  > | null;
}

const LISTING_SELECT = `
  *,
  seller:profiles!seller_id (
    id,
    display_name,
    avg_rating,
    rating_count,
    district,
    tier
  )
`;

const LISTING_DETAIL_SELECT = `
  *,
  seller:profiles!seller_id (
    id,
    display_name,
    avg_rating,
    rating_count,
    district,
    tier,
    avatar_url
  )
`;

export async function fetchListings(
  filters: ListingFilters = {},
): Promise<ListingWithSeller[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("asking_price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("asking_price", filters.maxPrice);
  }

  if (filters.district) {
    query = query.ilike("district", `%${filters.district}%`);
  }

  if (filters.query) {
    query = query.or(
      `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    let fallbackQuery = supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (filters.category && filters.category !== "all") {
      fallbackQuery = fallbackQuery.eq("category", filters.category);
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }

    return (fallbackData ?? []).map((row) => ({
      ...(row as Listing),
      seller: null,
    }));
  }

  return (data ?? []) as ListingWithSeller[];
}

export async function fetchListingById(
  id: string,
): Promise<ListingWithSeller | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_DETAIL_SELECT)
    .eq("id", id)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    const { data: fallback, error: fallbackError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .is("deleted_at", null)
      .maybeSingle();

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }

    if (!fallback) {
      return null;
    }

    return { ...(fallback as Listing), seller: null };
  }

  return data as ListingWithSeller | null;
}

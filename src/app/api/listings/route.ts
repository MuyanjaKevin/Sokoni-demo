import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { fetchListings } from "@/lib/listings-data";
import { createCookieClient } from "@/lib/supabase/cookie";
import { createServerClient } from "@/lib/supabase/server";

const createListingSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().max(2000).optional(),
  asking_price: z.number().int().positive(),
  category: z.string().trim().min(1).max(50),
  condition: z.enum(["new", "like_new", "good", "fair"]),
  district: z.string().trim().max(100).optional(),
  photo_urls: z.array(z.string().url()).min(1).max(6),
});

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const query = searchParams.get("q") ?? undefined;
    const district = searchParams.get("district") ?? undefined;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const listings = await fetchListings({
      category: category || undefined,
      query: query || undefined,
      district: district || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    return jsonSuccess(listings);
  } catch {
    return jsonError("Could not load listings", 500);
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
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid listing details");
    }

    const admin = createServerClient();
    const { data, error } = await admin
      .from("listings")
      .insert({
        seller_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        asking_price: parsed.data.asking_price,
        category: parsed.data.category,
        condition: parsed.data.condition,
        district: parsed.data.district ?? null,
        photo_urls: parsed.data.photo_urls,
        status: "active",
      })
      .select("id")
      .single();

    if (error) {
      return jsonError("Could not create listing", 500);
    }

    return jsonSuccess({ id: data.id }, 201);
  } catch {
    return jsonError("Something went wrong", 500);
  }
}

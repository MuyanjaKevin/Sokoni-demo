import { jsonError, jsonSuccess } from "@/lib/api";
import { fetchListingById } from "@/lib/listings-data";

export async function GET(
  _request: Request,
  context: { params: { id: string } },
): Promise<Response> {
  try {
    const listing = await fetchListingById(context.params.id);

    if (!listing) {
      return jsonError("Listing not found", 404);
    }

    return jsonSuccess(listing);
  } catch {
    return jsonError("Could not load listing", 500);
  }
}

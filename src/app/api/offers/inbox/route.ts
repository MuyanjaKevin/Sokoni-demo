import { jsonError, jsonSuccess } from "@/lib/api";
import { fetchOfferInboxForProfile } from "@/lib/offers";
import { createCookieClient } from "@/lib/supabase/cookie";
import { resolveProfileForUser } from "@/lib/profile-user";

export async function GET(): Promise<Response> {
  try {
    const cookieClient = createCookieClient();
    const {
      data: { user },
      error: userError,
    } = await cookieClient.auth.getUser();

    if (userError || !user) {
      return jsonError("You must be signed in", 401);
    }

    const profile = await resolveProfileForUser(user);

    if (!profile) {
      return jsonError("Complete your profile first", 400);
    }

    const offers = await fetchOfferInboxForProfile(profile.id);

    return jsonSuccess(offers);
  } catch {
    return jsonError("Could not load offer inbox", 500);
  }
}

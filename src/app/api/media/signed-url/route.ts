import { jsonError, jsonSuccess } from "@/lib/api";
import { createSignedUploadParams } from "@/lib/cloudinary";
import { createCookieClient } from "@/lib/supabase/cookie";

export async function POST(): Promise<Response> {
  try {
    const cookieClient = createCookieClient();
    const {
      data: { user },
      error: userError,
    } = await cookieClient.auth.getUser();

    if (userError || !user) {
      return jsonError("You must be signed in to upload images", 401);
    }

    const signed = createSignedUploadParams("listings");

    return jsonSuccess(signed);
  } catch {
    return jsonError("Could not prepare upload", 500);
  }
}

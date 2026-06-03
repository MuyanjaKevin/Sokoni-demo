import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createCookieClient } from "@/lib/supabase/cookie";
import { createServerClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(50),
  district: z.string().trim().min(1).max(100),
});

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
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid profile details");
    }

    const admin = createServerClient();
    const { error: updateError } = await admin
      .from("profiles")
      .update({
        display_name: parsed.data.display_name,
        district: parsed.data.district,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return jsonError("Could not save profile", 500);
    }

    return jsonSuccess({ redirectTo: "/" });
  } catch {
    return jsonError("Something went wrong", 500);
  }
}

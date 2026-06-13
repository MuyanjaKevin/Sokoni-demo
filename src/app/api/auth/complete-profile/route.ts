import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { updateProfileForUser } from "@/lib/profile-user";
import { createCookieClient } from "@/lib/supabase/cookie";

const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(50),
  district: z.string().trim().min(1).max(100),
  phone: z.string().trim().optional(),
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

    const profile = await updateProfileForUser(user, {
      display_name: parsed.data.display_name,
      district: parsed.data.district,
      ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
    });

    return jsonSuccess({ redirectTo: "/", profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return jsonError(message, 400);
  }
}

import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import {
  resolveProfileForUser,
  updateProfileForUser,
} from "@/lib/profile-user";
import { createCookieClient } from "@/lib/supabase/cookie";

const updateSchema = z.object({
  display_name: z.string().trim().min(2).max(50).optional(),
  district: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().optional(),
  avatar_url: z.string().url().max(500).nullable().optional(),
});

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
      return jsonError("Profile not found", 404);
    }

    return jsonSuccess(profile);
  } catch {
    return jsonError("Something went wrong", 500);
  }
}

export async function PATCH(request: Request): Promise<Response> {
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
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return jsonError("Invalid profile update");
    }

    const profile = await updateProfileForUser(user, parsed.data);

    return jsonSuccess(profile);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return jsonError(message, 400);
  }
}

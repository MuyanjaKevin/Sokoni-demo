import { createServerClient } from "@/lib/supabase/server";
import { createCookieClient } from "@/lib/supabase/cookie";
import { phoneToAuthEmail } from "@/lib/auth";
import type { Profile } from "@/types";

interface SessionResult {
  userId: string;
  needsProfileSetup: boolean;
}

export async function establishSessionForPhone(
  phone: string,
): Promise<SessionResult> {
  const admin = createServerClient();
  const cookieClient = createCookieClient();
  const email = phoneToAuthEmail(phone);

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, display_name")
    .eq("phone", phone)
    .maybeSingle();

  if (existingProfile) {
    const { error: createError } = await admin.auth.admin.createUser({
      id: existingProfile.id,
      email,
      email_confirm: true,
      user_metadata: { phone },
    });

    if (
      createError &&
      !createError.message.toLowerCase().includes("already")
    ) {
      throw new Error("Could not link account");
    }
  }

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        data: { phone },
      },
    });

  if (linkError || !linkData.properties?.hashed_token) {
    throw new Error("Could not start session");
  }

  const { data: sessionData, error: verifyError } =
    await cookieClient.auth.verifyOtp({
      type: "email",
      token_hash: linkData.properties.hashed_token,
    });

  if (verifyError || !sessionData.user) {
    throw new Error("Could not verify session");
  }

  const userId = sessionData.user.id;
  let profile = existingProfile as Pick<Profile, "id" | "display_name"> | null;

  if (!profile) {
    const { data: inserted, error: insertError } = await admin
      .from("profiles")
      .insert({
        id: userId,
        phone,
        display_name: "New User",
      })
      .select("id, display_name")
      .single();

    if (insertError) {
      throw new Error("Could not create profile");
    }

    profile = inserted;
  }

  const needsProfileSetup =
    profile.display_name === "New User" || profile.display_name.trim() === "";

  return { userId, needsProfileSetup };
}

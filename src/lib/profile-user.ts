import { isValidUgandaPhone, phoneToAuthEmail } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

type AuthUser = {
  id: string;
  user_metadata?: Record<string, unknown>;
};

export function phoneFromUser(user: AuthUser): string | null {
  const phone = user.user_metadata?.phone;
  return typeof phone === "string" && phone.trim() !== "" ? phone : null;
}

/** Match profile by login phone first — handles auth id ≠ profile id (seed accounts). */
export async function resolveProfileForUser(
  user: AuthUser,
): Promise<Profile | null> {
  const admin = createServerClient();
  const phone = phoneFromUser(user);

  if (phone) {
    const { data: byPhone } = await admin
      .from("profiles")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (byPhone) {
      return byPhone as Profile;
    }
  }

  const { data: byId } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (byId as Profile | null) ?? null;
}

export async function ensureProfileForUser(user: AuthUser): Promise<Profile> {
  const existing = await resolveProfileForUser(user);
  if (existing) {
    return existing;
  }

  const admin = createServerClient();
  const phone = phoneFromUser(user);

  if (!phone || !isValidUgandaPhone(phone)) {
    throw new Error("Profile not found. Complete profile setup first.");
  }

  const { data, error } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      phone,
      display_name: "New User",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Could not create profile");
  }

  return data as Profile;
}

export async function updateProfileForUser(
  user: AuthUser,
  updates: {
    display_name?: string;
    district?: string;
    phone?: string;
    avatar_url?: string | null;
  },
): Promise<Profile> {
  const admin = createServerClient();
  const profile = await ensureProfileForUser(user);

  if (updates.phone !== undefined) {
    if (!isValidUgandaPhone(updates.phone)) {
      throw new Error("Phone must be a valid Uganda number (+256XXXXXXXXX)");
    }

    const { data: phoneTaken } = await admin
      .from("profiles")
      .select("id")
      .eq("phone", updates.phone)
      .neq("id", profile.id)
      .maybeSingle();

    if (phoneTaken) {
      throw new Error("That phone number is already registered");
    }

    const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
      email: phoneToAuthEmail(updates.phone),
      user_metadata: { phone: updates.phone },
    });

    if (authError) {
      throw new Error("Could not update phone on account");
    }
  }

  const { data, error } = await admin
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Could not save profile");
  }

  return data as Profile;
}

export function navbarDisplayName(profile: Profile | null): string | null {
  if (!profile) {
    return null;
  }

  const name = profile.display_name.trim();
  if (name === "" || name === "New User") {
    return null;
  }

  return name;
}

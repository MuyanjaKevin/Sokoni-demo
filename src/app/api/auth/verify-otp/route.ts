import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { establishSessionForPhone } from "@/lib/auth-session";
import {
  hashPhone,
  isValidUgandaPhone,
  verifyOtpHash,
} from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";

const verifySchema = z.object({
  phone: z.string().trim(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export async function POST(
  request: Request,
): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid phone or verification code");
    }

    const { phone, otp } = parsed.data;

    if (!isValidUgandaPhone(phone)) {
      return jsonError("Phone must be a valid Uganda number (+256XXXXXXXXX)");
    }

    const phoneHash = hashPhone(phone);
    const admin = createServerClient();
    const now = new Date().toISOString();

    const { data: otpRow, error: fetchError } = await admin
      .from("otp_codes")
      .select("id, otp_hash, attempt_count, used_at, expires_at")
      .eq("phone_hash", phoneHash)
      .is("used_at", null)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !otpRow) {
      return jsonError("Code expired or not found. Request a new one.");
    }

    if (otpRow.attempt_count >= 5) {
      return jsonError("Too many attempts. Request a new code.");
    }

    const isValid = await verifyOtpHash(otp, otpRow.otp_hash);

    if (!isValid) {
      await admin
        .from("otp_codes")
        .update({ attempt_count: otpRow.attempt_count + 1 })
        .eq("id", otpRow.id);

      return jsonError("Incorrect verification code");
    }

    await admin
      .from("otp_codes")
      .update({ used_at: now })
      .eq("id", otpRow.id);

    const { needsProfileSetup } = await establishSessionForPhone(phone);

    return jsonSuccess({
      redirectTo: needsProfileSetup ? "/profile-setup" : "/",
    });
  } catch {
    return jsonError("Could not verify code. Try again.", 500);
  }
}

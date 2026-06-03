import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import {
  DEMO_MODE,
  generateOtpCode,
  hashOtp,
  hashPhone,
  isValidUgandaPhone,
  OTP_MAX_REQUESTS_PER_HOUR,
} from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  phone: z.string().trim(),
});

export async function POST(
  request: Request,
): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid phone number");
    }

    const phone = parsed.data.phone;

    if (!isValidUgandaPhone(phone)) {
      return jsonError("Phone must be a valid Uganda number (+256XXXXXXXXX)");
    }

    const phoneHash = hashPhone(phone);
    const admin = createServerClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count, error: countError } = await admin
      .from("otp_codes")
      .select("id", { count: "exact", head: true })
      .eq("phone_hash", phoneHash)
      .gte("created_at", oneHourAgo);

    if (countError) {
      return jsonError("Could not process request", 500);
    }

    if ((count ?? 0) >= OTP_MAX_REQUESTS_PER_HOUR) {
      return jsonError("Too many OTP requests. Try again in an hour.", 429);
    }

    const otp = generateOtpCode();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await admin.from("otp_codes").insert({
      phone_hash: phoneHash,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    if (insertError) {
      return jsonError("Could not send verification code", 500);
    }

    return jsonSuccess({
      message: DEMO_MODE
        ? "Demo mode — use code 123456"
        : "Verification code sent",
      demo: DEMO_MODE,
    });
  } catch {
    return jsonError("Something went wrong", 500);
  }
}

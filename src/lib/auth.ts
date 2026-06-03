import { createHash, randomInt } from "crypto";
import bcrypt from "bcryptjs";

export const DEMO_MODE = true;
export const DEMO_OTP = "123456";
export const UGANDA_PHONE_REGEX = /^\+256\d{9}$/;
export const OTP_BCRYPT_ROUNDS = 12;
export const OTP_MAX_REQUESTS_PER_HOUR = 3;

export function normalizeUgandaPhone(digits: string): string {
  const cleaned = digits.replace(/\D/g, "").slice(0, 9);
  return `+256${cleaned}`;
}

export function isValidUgandaPhone(phone: string): boolean {
  return UGANDA_PHONE_REGEX.test(phone);
}

export function hashPhone(phone: string): string {
  return createHash("sha256").update(phone).digest("hex");
}

export function phoneToAuthEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `user.${digits}@sokoni.ug`;
}

export function generateOtpCode(): string {
  if (DEMO_MODE) {
    return DEMO_OTP;
  }
  return String(randomInt(100000, 1000000));
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
}

export async function verifyOtpHash(
  otp: string,
  otpHash: string,
): Promise<boolean> {
  if (DEMO_MODE && otp === DEMO_OTP) {
    return true;
  }
  return bcrypt.compare(otp, otpHash);
}

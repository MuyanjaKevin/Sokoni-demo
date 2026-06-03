import { createHash } from "crypto";
import { config } from "@/lib/config";

const SIGNED_URL_TTL_SECONDS = 60;

export interface CloudinarySignedUpload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  expiresAt: number;
}

export function createSignedUploadParams(
  folder = "listings",
): CloudinarySignedUpload {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(`${paramsToSign}${config.cloudinary.apiSecret}`)
    .digest("hex");

  return {
    cloudName: config.cloudinary.cloudName,
    apiKey: config.cloudinary.apiKey,
    timestamp,
    signature,
    folder,
    expiresAt: timestamp + SIGNED_URL_TTL_SECONDS,
  };
}

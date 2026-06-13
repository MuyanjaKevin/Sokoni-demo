function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

function requirePublicEnv(
  key: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
): string {
  // Next.js only inlines NEXT_PUBLIC_* when accessed with a static property name.
  const value =
    key === "NEXT_PUBLIC_SUPABASE_URL"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : key === "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        : process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export type PublicSupabaseConfig = {
  url: string;
  anonKey: string;
};

type AppConfig = {
  supabase: PublicSupabaseConfig & {
    serviceRoleKey: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
};

let cachedPublicConfig: PublicSupabaseConfig | null = null;
let cachedServerConfig: AppConfig | null = null;

/**
 * Safe for browser/client — only reads NEXT_PUBLIC_* Supabase vars.
 * Server-only secrets are not required here.
 */
export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  if (!cachedPublicConfig) {
    cachedPublicConfig = {
      url: requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
      anonKey: requirePublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    };
  }
  return cachedPublicConfig;
}

/** Server/API only — includes service role and Cloudinary secrets. */
export function getConfig(): AppConfig {
  if (!cachedServerConfig) {
    const publicSupabase = getPublicSupabaseConfig();
    cachedServerConfig = {
      supabase: {
        ...publicSupabase,
        serviceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      },
      cloudinary: {
        cloudName: requirePublicEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
        apiKey: requireEnv("CLOUDINARY_API_KEY"),
        apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
      },
    };
  }
  return cachedServerConfig;
}

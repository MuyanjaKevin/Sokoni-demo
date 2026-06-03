import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "@/lib/config";

/** Service-role client for API routes only — never import in client components. */
export function createServerClient(): SupabaseClient {
  const config = getConfig();
  return createSupabaseClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

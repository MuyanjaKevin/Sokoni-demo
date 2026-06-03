import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";
import type { Database } from "@/types";

/** Service-role client for API routes only — never import in client components. */
export function createServerClient(): ReturnType<
  typeof createSupabaseClient<Database>
> {
  return createSupabaseClient<Database>(
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

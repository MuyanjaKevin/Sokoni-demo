import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "@/lib/config";

let publicClient: SupabaseClient | null = null;

/** Anon client for public reads (RLS applies). Server components only. */
export function createPublicClient(): SupabaseClient {
  if (!publicClient) {
    const config = getConfig();
    publicClient = createClient(config.supabase.url, config.supabase.anonKey);
  }
  return publicClient;
}

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "@/lib/config";

export function createClient(): SupabaseClient {
  const config = getConfig();
  return createBrowserClient(
    config.supabase.url,
    config.supabase.anonKey,
  );
}

import { createBrowserClient } from "@supabase/ssr";
import { config } from "@/lib/config";
import type { Database } from "@/types";

export function createClient(): ReturnType<typeof createBrowserClient<Database>> {
  return createBrowserClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
  );
}

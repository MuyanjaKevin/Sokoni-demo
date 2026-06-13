import Link from "next/link";
import { Inbox, Plus, Search, Store, User } from "lucide-react";
import { createCookieClient } from "@/lib/supabase/cookie";
import {
  navbarDisplayName,
  resolveProfileForUser,
} from "@/lib/profile-user";

export async function MainNavbar(): Promise<React.JSX.Element> {
  const supabase = createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;

  if (user) {
    const profile = await resolveProfileForUser(user);
    displayName = navbarDisplayName(profile);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
            <Store className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-brand-primary">
            Sokoni
          </span>
        </Link>

        <Link
          href="/search"
          className="hidden flex-1 items-center gap-2 rounded-full border border-input bg-brand-background px-4 py-2 text-sm text-brand-muted transition-colors hover:border-brand-primary/30 sm:flex sm:max-w-md"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span>Search listings…</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-muted hover:bg-brand-background sm:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/listings/create"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-accent px-3 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-brand-accent/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Sell</span>
          </Link>
          {user ? (
            <>
              <Link
                href="/inbox"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-muted hover:bg-brand-background"
                aria-label="Inbox"
              >
                <Inbox className="h-5 w-5" />
              </Link>
              <Link
                href="/profile/me"
                className="inline-flex max-w-[140px] items-center gap-1.5 truncate rounded-lg bg-brand-primary/5 px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10"
                title={displayName ?? "Account"}
              >
                <User className="h-4 w-4 shrink-0" />
                <span className="truncate">{displayName ?? "Account"}</span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-muted hover:text-brand-primary"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

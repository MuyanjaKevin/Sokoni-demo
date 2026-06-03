import Link from "next/link";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { ListingsSection } from "@/components/ListingsSection";
import { fetchListings } from "@/lib/listings-data";

interface HomePageProps {
  searchParams: { category?: string };
}

export default async function HomePage({
  searchParams,
}: HomePageProps): Promise<React.JSX.Element> {
  let listings: Awaited<ReturnType<typeof fetchListings>> = [];
  let loadError: string | null = null;

  try {
    listings = await fetchListings({
      category: searchParams.category,
    });
  } catch {
    loadError = "Could not load listings. Check your connection and try again.";
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-[#1e7a45] to-[#145a32] px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative mx-auto max-w-7xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
            Uganda&apos;s trusted P2P marketplace
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            Find deals. Sell fast. Stay protected.
          </h1>
          <p className="mt-4 max-w-lg text-sm text-white/85 sm:text-base">
            Fashion, tech, and more from verified sellers in Kampala and beyond.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-brand-text shadow-lg shadow-black/10 transition hover:bg-brand-accent/90"
            >
              Browse listings
            </Link>
            <Link
              href="/listings/create"
              className="rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20"
            >
              Start selling
            </Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-center text-xs sm:text-sm">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <ShieldCheck className="mx-auto h-5 w-5 text-brand-accent" />
              <p className="mt-2 font-medium">Escrow safe</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <Zap className="mx-auto h-5 w-5 text-brand-accent" />
              <p className="mt-2 font-medium">Quick offers</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <Sparkles className="mx-auto h-5 w-5 text-brand-accent" />
              <p className="mt-2 font-medium">Rated sellers</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        {loadError ? (
          <ErrorState message={loadError} />
        ) : (
          <ListingsSection listings={listings} />
        )}
      </div>
    </div>
  );
}

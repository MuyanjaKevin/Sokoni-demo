import { Suspense } from "react";
import { PackageOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFilter } from "@/components/CategoryFilter";
import { EmptyState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import type { ListingWithSeller } from "@/lib/listings-data";

interface ListingsSectionProps {
  listings: ListingWithSeller[];
  title?: string;
  showCategories?: boolean;
  basePath?: string;
}

export function ListingsSection({
  listings,
  title = "Fresh on Sokoni",
  showCategories = true,
  basePath = "/",
}: ListingsSectionProps): React.JSX.Element {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-text">
            {title}
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            {listings.length} listing{listings.length === 1 ? "" : "s"} near you
          </p>
        </div>
        {showCategories ? (
          <div className="w-full sm:max-w-xl">
            <Suspense
              fallback={
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-24 rounded-full" />
                  ))}
                </div>
              }
            >
              <CategoryFilter basePath={basePath} />
            </Suspense>
          </div>
        ) : null}
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No listings yet"
          description="Try another category or list something yourself."
          actionLabel="Sell something"
          actionHref="/listings/create"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              priority={index < 4}
            />
          ))}
        </div>
      )}
    </section>
  );
}

import { Suspense } from "react";
import { SearchPageContent } from "./SearchPageContent";
import { ListingGridSkeleton } from "@/components/ListingGridSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">
          Search Sokoni
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Filter by category, price, and keywords
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <ListingGridSkeleton />
          </div>
        }
      >
        <SearchPageContent />
      </Suspense>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

interface ListingGridSkeletonProps {
  count?: number;
}

export function ListingGridSkeleton({
  count = 8,
}: ListingGridSkeletonProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl bg-white shadow-sm"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

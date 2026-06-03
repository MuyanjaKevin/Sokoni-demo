"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { ListingCard } from "@/components/ListingCard";
import { ListingGridSkeleton } from "@/components/ListingGridSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LISTING_CATEGORIES } from "@/lib/listings";
import type { ListingWithSeller } from "@/lib/listings-data";
import type { ApiResponse } from "@/types";
import { PackageOpen } from "lucide-react";

export function SearchPageContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(
    searchParams.get("category") ?? "all",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const loadListings = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category && category !== "all") params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    try {
      const response = await fetch(`/api/listings?${params.toString()}`);
      const result = (await response.json()) as ApiResponse<ListingWithSeller[]>;

      if (!result.success) {
        setError(result.error ?? "Failed to load");
        setListings([]);
        return;
      }

      setListings(result.data ?? []);
    } catch {
      setError("Network error");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [query, category, minPrice, maxPrice]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "all") params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.replace(`/search?${params.toString()}`);
    void loadListings();
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSearch}
        className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-2 lg:col-span-2">
            <Label htmlFor="q">Keywords</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <Input
                id="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="iPhone, Nike, PS5…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(value) => value && setCategory(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {LISTING_CATEGORIES.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min (UGX)</Label>
              <Input
                id="minPrice"
                type="number"
                inputMode="numeric"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max (UGX)</Label>
              <Input
                id="maxPrice"
                type="number"
                inputMode="numeric"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Any"
              />
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="mt-4 w-full rounded-lg bg-brand-primary hover:bg-brand-primary/90 sm:w-auto"
        >
          Search
        </Button>
      </form>

      {loading ? (
        <ListingGridSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadListings()} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No matches"
          description="Try different filters or broaden your price range."
          actionLabel="View all"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

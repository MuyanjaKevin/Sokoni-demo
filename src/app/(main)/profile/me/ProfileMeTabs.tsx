"use client";

import Link from "next/link";
import { Package, Settings, ShoppingBag, Star } from "lucide-react";
import { EditProfileForm } from "./EditProfileForm";
import { PurchaseList } from "./ProfileMeClient";
import { EmptyState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import { ReviewCard } from "@/components/ReviewCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ListingWithSeller } from "@/lib/listings-data";
import type { PurchaseRow } from "@/lib/profile-data";
import type { RatingWithRater } from "@/lib/ratings";
import type { Profile } from "@/types";

interface ProfileMeTabsProps {
  profile: Profile;
  listings: ListingWithSeller[];
  purchases: PurchaseRow[];
  reviews: RatingWithRater[];
}

const tabTriggerClass =
  "h-11 rounded-lg px-2 text-sm font-semibold text-brand-muted transition-colors hover:bg-brand-background hover:text-brand-text data-active:bg-brand-primary data-active:text-white data-active:shadow-sm sm:px-3";

export function ProfileMeTabs({
  profile,
  listings,
  purchases,
  reviews,
}: ProfileMeTabsProps): React.JSX.Element {
  return (
    <section className="mt-6 w-full">
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid h-auto grid-cols-2 gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5 sm:grid-cols-4">
          <TabsTrigger value="listings" className={tabTriggerClass}>
            <Package className="h-4 w-4 shrink-0" />
            <span className="truncate">Listings</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {listings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="purchases" className={tabTriggerClass}>
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="truncate">Purchases</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {purchases.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className={tabTriggerClass}>
            <Star className="h-4 w-4 shrink-0" />
            <span className="truncate">Reviews</span>
            <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
              {reviews.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="settings" className={tabTriggerClass}>
            <Settings className="h-4 w-4 shrink-0" />
            <span className="truncate">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <div className="rounded-xl bg-brand-background/60 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-brand-text">Your listings</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  {listings.length === 0
                    ? "Nothing listed yet — start selling today"
                    : `${listings.length} item${listings.length === 1 ? "" : "s"} on Sokoni`}
                </p>
              </div>
              <Link
                href="/listings/create"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-brand-accent px-4 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-brand-accent/90"
              >
                + New listing
              </Link>
            </div>

            <div className="mt-5">
              {listings.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No listings yet"
                  description="Create your first listing and reach buyers across Uganda."
                  actionLabel="Create listing"
                  actionHref="/listings/create"
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          <div className="rounded-xl bg-brand-background/60 p-4 sm:p-5">
            <h2 className="text-xl font-bold text-brand-text">Your purchases</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Track items you&apos;ve bought on Sokoni
            </p>
            <div className="mt-5">
              <PurchaseList purchases={purchases} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="rounded-xl bg-brand-background/60 p-4 sm:p-5">
            <h2 className="text-xl font-bold text-brand-text">Your reviews</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Feedback from buyers and sellers
            </p>
            <div className="mt-5 space-y-4">
              {reviews.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="No reviews yet"
                  description="Complete a transaction to receive your first review."
                />
              ) : (
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="rounded-xl bg-brand-background/60 p-4 sm:p-5">
            <h2 className="text-xl font-bold text-brand-text">Account settings</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Update your name, phone, and location
            </p>
            <div className="mt-5">
              <EditProfileForm profile={profile} embedded />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

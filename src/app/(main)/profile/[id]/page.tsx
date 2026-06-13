import { notFound } from "next/navigation";
import { Package, PackageOpen, Star } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ReviewCard } from "@/components/ReviewCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchProfileReviews,
  fetchProfileWithStats,
  fetchSellerListings,
} from "@/lib/profile-data";
import type { ListingWithSeller } from "@/lib/listings-data";

interface PublicProfilePageProps {
  params: { id: string };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps): Promise<React.JSX.Element> {
  const profile = await fetchProfileWithStats(params.id).catch(() => null);

  if (!profile) {
    notFound();
  }

  const [listings, reviews] = await Promise.all([
    fetchSellerListings(params.id).catch(() => []),
    fetchProfileReviews(params.id).catch(() => []),
  ]);

  const listingCards: ListingWithSeller[] = listings.map((listing) => ({
    ...listing,
    seller: {
      id: profile.id,
      display_name: profile.display_name,
      avg_rating: profile.avg_rating,
      rating_count: profile.rating_count,
      district: profile.district,
      tier: profile.tier,
    },
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ProfileHeader profile={profile} />

      <Tabs defaultValue="listings" className="mt-6 w-full">
        <TabsList className="grid h-auto grid-cols-2 gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5">
          <TabsTrigger
            value="listings"
            className="h-11 rounded-lg text-sm font-semibold text-brand-muted data-active:bg-brand-primary data-active:text-white"
          >
            <Package className="mr-1.5 h-4 w-4" />
            Listings ({listingCards.length})
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="h-11 rounded-lg text-sm font-semibold text-brand-muted data-active:bg-brand-primary data-active:text-white"
          >
            <Star className="mr-1.5 h-4 w-4" />
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <div className="rounded-xl bg-brand-background/60 p-4 sm:p-5">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-brand-text">Listings for sale</h2>
              <p className="mt-1 text-sm text-brand-muted">
                {listingCards.length} active listing
                {listingCards.length === 1 ? "" : "s"}
              </p>
            </div>
          {listingCards.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No active listings"
              description={`${profile.display_name} has no items for sale right now.`}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {listingCards.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="rounded-xl bg-brand-background/60 p-4 sm:p-5">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-brand-text">Reviews</h2>
              <p className="mt-1 text-sm text-brand-muted">
                What others say about {profile.display_name}
              </p>
            </div>
          {reviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              description="Reviews appear after completed transactions."
            />
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

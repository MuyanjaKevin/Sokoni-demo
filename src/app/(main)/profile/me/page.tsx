import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileMeActions } from "./ProfileMeClient";
import { ProfileMeTabs } from "./ProfileMeTabs";
import { ProfileHeader } from "@/components/ProfileHeader";
import {
  fetchProfileReviews,
  fetchProfileWithStats,
  fetchSellerListings,
  fetchUserPurchases,
} from "@/lib/profile-data";
import { createCookieClient } from "@/lib/supabase/cookie";
import { resolveProfileForUser } from "@/lib/profile-user";
import type { ListingWithSeller } from "@/lib/listings-data";

export default async function OwnProfilePage(): Promise<React.JSX.Element> {
  const supabase = createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile/me");
  }

  const profile = await resolveProfileForUser(user);

  if (!profile) {
    redirect("/profile-setup");
  }

  const profileStats = await fetchProfileWithStats(profile.id).catch(() => null);
  const profileDetail = profileStats ?? {
    ...profile,
    active_listings_count: 0,
    completed_sales_count: 0,
  };

  const [listings, purchases, reviews] = await Promise.all([
    fetchSellerListings(profile.id, { includeSold: true }).catch(() => []),
    fetchUserPurchases(user.id).catch(() => []),
    fetchProfileReviews(profile.id).catch(() => []),
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">My profile</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Your shop, purchases, and reputation
          </p>
        </div>
        <ProfileMeActions profileId={profile.id} />
      </div>

      <ProfileHeader profile={profileDetail} isOwn />

      <ProfileMeTabs
        profile={profile}
        listings={listingCards}
        purchases={purchases}
        reviews={reviews}
      />
    </div>
  );
}

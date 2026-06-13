import { MapPin, Package, ShoppingBag, Star } from "lucide-react";
import { TierBadge } from "@/components/TierBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ProfileDetail } from "@/lib/profile-data";

interface ProfileHeaderProps {
  profile: ProfileDetail;
  isOwn?: boolean;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProfileHeader({
  profile,
  isOwn = false,
}: ProfileHeaderProps): React.JSX.Element {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar className="h-20 w-20 ring-2 ring-brand-primary/10">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
          ) : null}
          <AvatarFallback className="bg-brand-primary/10 text-lg font-bold text-brand-primary">
            {initials(profile.display_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-brand-text">
              {profile.display_name}
            </h1>
            <TierBadge tier={profile.tier} />
            {isOwn ? (
              <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
                You
              </span>
            ) : null}
          </div>

          {profile.district ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-brand-muted">
              <MapPin className="h-3.5 w-3.5" />
              {profile.district}
            </p>
          ) : null}

          {profile.rating_count > 0 ? (
            <p className="mt-2 flex items-center gap-1 text-sm text-brand-text">
              <Star className="h-4 w-4 fill-brand-accent text-brand-accent" />
              <span className="font-semibold">
                {Number(profile.avg_rating).toFixed(1)}
              </span>
              <span className="text-brand-muted">
                ({profile.rating_count} review
                {profile.rating_count === 1 ? "" : "s"})
              </span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-brand-muted">No reviews yet</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-black/5 pt-4">
        <div className="text-center">
          <p className="flex items-center justify-center gap-1 text-lg font-bold text-brand-primary">
            <Package className="h-4 w-4" />
            {profile.active_listings_count}
          </p>
          <p className="text-xs text-brand-muted">Active listings</p>
        </div>
        <div className="text-center">
          <p className="flex items-center justify-center gap-1 text-lg font-bold text-brand-primary">
            <ShoppingBag className="h-4 w-4" />
            {profile.completed_sales_count}
          </p>
          <p className="text-xs text-brand-muted">Completed sales</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-brand-primary">
            {profile.hustle_points}
          </p>
          <p className="text-xs text-brand-muted">Hustle points</p>
        </div>
      </div>
    </div>
  );
}

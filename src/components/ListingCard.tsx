import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCondition } from "@/lib/listings";
import { getListingPrimaryPhoto } from "@/lib/listing-images";
import { formatUGX } from "@/lib/utils";
import type { ListingWithSeller } from "@/lib/listings-data";

interface ListingCardProps {
  listing: ListingWithSeller;
  priority?: boolean;
}

export function ListingCard({
  listing,
  priority = false,
}: ListingCardProps): React.JSX.Element {
  const imageUrl = getListingPrimaryPhoto(
    listing.title,
    listing.category,
    listing.photo_urls,
  );
  const sellerName = listing.seller?.display_name ?? "Seller";
  const location = listing.district ?? listing.seller?.district ?? "Uganda";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-primary/20"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-background">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={priority}
        />
        <Badge
          className="absolute left-2 top-2 border-0 bg-white/95 text-[10px] font-medium text-brand-text shadow-sm"
        >
          {formatCondition(listing.condition)}
        </Badge>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-brand-text group-hover:text-brand-primary">
          {listing.title}
        </p>
        <p className="mt-1.5 text-base font-bold text-brand-primary">
          {formatUGX(listing.asking_price)}
        </p>
        <div className="mt-2 flex items-center justify-between gap-1 text-xs text-brand-muted">
          <span className="flex items-center gap-0.5 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            {location}
          </span>
          {listing.seller && listing.seller.avg_rating > 0 ? (
            <span className="flex shrink-0 items-center gap-0.5">
              <Star className="h-3 w-3 fill-brand-accent text-brand-accent" />
              {Number(listing.seller.avg_rating).toFixed(1)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-[11px] text-brand-muted">{sellerName}</p>
      </div>
    </Link>
  );
}

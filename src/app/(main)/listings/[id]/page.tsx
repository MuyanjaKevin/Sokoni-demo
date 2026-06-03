import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  Shield,
  Star,
} from "lucide-react";
import { TierBadge } from "@/components/TierBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCondition } from "@/lib/listings";
import { fetchListingById } from "@/lib/listings-data";
import { formatUGX } from "@/lib/utils";

interface ListingDetailPageProps {
  params: { id: string };
}

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps): Promise<React.JSX.Element> {
  let listing = null;

  try {
    listing = await fetchListingById(params.id);
  } catch {
    notFound();
  }

  if (!listing) {
    notFound();
  }

  const images =
    listing.photo_urls.length > 0
      ? listing.photo_urls
      : ["/placeholder-listing.svg"];
  const seller = listing.seller;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5">
            <Image
              src={images[0]}
              alt={listing.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-black/5"
                >
                  <Image
                    src={url}
                    alt={`${listing.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/10">
                {listing.category}
              </Badge>
              <Badge variant="outline">{formatCondition(listing.condition)}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-brand-text sm:text-3xl">
              {listing.title}
            </h1>
            <p className="mt-3 text-3xl font-bold text-brand-primary">
              {formatUGX(listing.asking_price)}
            </p>
            {listing.district ? (
              <p className="mt-2 flex items-center gap-1 text-sm text-brand-muted">
                <MapPin className="h-4 w-4" />
                {listing.district}
              </p>
            ) : null}
          </div>

          {listing.description ? (
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="font-semibold text-brand-text">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-muted">
                {listing.description}
              </p>
            </div>
          ) : null}

          {seller ? (
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="font-semibold text-brand-text">Seller</h2>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-brand-text">
                    {seller.display_name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <TierBadge tier={seller.tier} />
                    {seller.avg_rating > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-brand-muted">
                        <Star className="h-3.5 w-3.5 fill-brand-accent text-brand-accent" />
                        {Number(seller.avg_rating).toFixed(1)} (
                        {seller.rating_count})
                      </span>
                    ) : null}
                  </div>
                </div>
                <Link
                  href={`/profile/${seller.id}`}
                  className="text-sm font-medium text-brand-primary hover:underline"
                >
                  View profile
                </Link>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/listings/${listing.id}/offer`}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-primary/20 transition hover:bg-brand-primary/90"
            >
              Make an offer
            </Link>
            <Button
              variant="outline"
              className="flex-1 gap-2 rounded-lg"
              disabled
            >
              <MessageCircle className="h-4 w-4" />
              Chat (after offer)
            </Button>
          </div>

          <p className="flex items-center gap-2 text-xs text-brand-muted">
            <Shield className="h-4 w-4 text-brand-success" />
            Payments protected by Sokoni escrow
          </p>
        </div>
      </div>
    </div>
  );
}

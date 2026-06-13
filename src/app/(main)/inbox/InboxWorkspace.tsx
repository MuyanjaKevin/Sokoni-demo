"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  HandCoins,
  Inbox,
  Loader2,
  MessageCircle,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOfferInbox } from "@/hooks/useOfferInbox";
import { getListingPrimaryPhoto } from "@/lib/listing-images";
import type { InboxItem } from "@/lib/profile-data";
import type { InboxOfferItem } from "@/lib/offers-shared";
import { formatUGX } from "@/lib/utils";
import type { ApiResponse } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  escrowed: "Paid — awaiting dispatch",
  in_delivery: "In delivery",
};

interface InboxWorkspaceProps {
  profileId: string;
  authUserId: string;
  deals: InboxItem[];
}

function OfferInboxCard({
  offer,
  onAction,
  acting,
}: {
  offer: InboxOfferItem;
  onAction: () => void;
  acting: boolean;
}): React.JSX.Element {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const listing = offer.listing;
  const imageUrl = listing
    ? getListingPrimaryPhoto(listing.title, listing.category, listing.photo_urls)
    : "/placeholder-listing.svg";

  async function handleAction(
    action: "accept" | "decline",
  ): Promise<void> {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/offers/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = (await response.json()) as ApiResponse<{
        status: string;
        transaction_id?: string;
      }>;

      if (!result.success) {
        toast.error(result.error ?? "Action failed");
        return;
      }

      if (action === "accept" && result.data?.transaction_id) {
        toast.success("Offer accepted — starting checkout");
        router.push(`/transactions/${result.data.transaction_id}`);
        return;
      }

      toast.success(action === "accept" ? "Offer accepted" : "Offer declined");
      onAction();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const isSellerView = offer.role === "seller";

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-0 bg-brand-accent/20 text-[10px] text-brand-text hover:bg-brand-accent/20">
              {isSellerView ? "New offer" : "Counter offer"}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {isSellerView ? "You sell" : "You buy"}
            </Badge>
          </div>
          <p className="mt-1 truncate font-medium text-brand-text">
            {listing?.title ?? "Listing"}
          </p>
          <p className="text-lg font-bold text-brand-primary">
            {formatUGX(offer.proposed_price)}
          </p>
          <p className="text-xs text-brand-muted">
            {isSellerView
              ? `From ${offer.buyer?.display_name ?? "Buyer"}`
              : `Seller counter — was ${listing ? formatUGX(listing.asking_price) : "—"}`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1 rounded-lg bg-brand-primary hover:bg-brand-primary/90"
          disabled={acting || submitting}
          onClick={() => void handleAction("accept")}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-lg"
          disabled={acting || submitting}
          onClick={() => void handleAction("decline")}
        >
          Decline
        </Button>
        {listing ? (
          <Link
            href={`/listings/${listing.id}/offer`}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-input px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-background"
          >
            Negotiate
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function InboxWorkspace({
  profileId,
  authUserId,
  deals,
}: InboxWorkspaceProps): React.JSX.Element {
  const { offers, loading, error, reload } = useOfferInbox(profileId);
  const [acting, setActing] = useState(false);

  return (
    <Tabs defaultValue="offers" className="w-full">
      <TabsList className="grid h-auto grid-cols-2 gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5">
        <TabsTrigger
          value="offers"
          className="h-11 rounded-lg text-sm font-semibold text-brand-muted data-active:bg-brand-primary data-active:text-white"
        >
          <HandCoins className="mr-1.5 h-4 w-4" />
          Offers
          {offers.length > 0 ? (
            <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold">
              {offers.length}
            </span>
          ) : null}
        </TabsTrigger>
        <TabsTrigger
          value="deals"
          className="h-11 rounded-lg text-sm font-semibold text-brand-muted data-active:bg-brand-primary data-active:text-white"
        >
          <Package className="mr-1.5 h-4 w-4" />
          Active deals
          {deals.length > 0 ? (
            <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px] font-bold">
              {deals.length}
            </span>
          ) : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="offers" className="mt-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-brand-danger">
            {error}
            <Button variant="outline" className="mt-3" onClick={reload}>
              Retry
            </Button>
          </div>
        ) : offers.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title="No pending offers"
            description="When someone makes an offer on your listing — or counters yours — it will appear here instantly."
            actionLabel="Browse listings"
            actionHref="/search"
          />
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <OfferInboxCard
                key={offer.id}
                offer={offer}
                acting={acting}
                onAction={() => {
                  setActing(false);
                  reload();
                }}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="deals" className="mt-6">
        {deals.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No active deals"
            description="Accepted offers become deals here — payment, delivery, and chat."
            actionLabel="View profile"
            actionHref="/profile/me"
          />
        ) : (
          <div className="space-y-3">
            {deals.map((item) => {
              const listing = item.listing;
              const imageUrl = listing
                ? getListingPrimaryPhoto(
                    listing.title,
                    listing.category,
                    listing.photo_urls,
                  )
                : "/placeholder-listing.svg";
              const role =
                item.buyer_id === profileId || item.buyer_id === authUserId
                  ? ("Buying" as const)
                  : ("Selling" as const);

              return (
                <article
                  key={item.id}
                  className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {role}
                        </Badge>
                        <Badge className="border-0 bg-brand-primary/10 text-[10px] text-brand-primary hover:bg-brand-primary/10">
                          {STATUS_LABELS[item.status] ?? item.status}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate font-medium text-brand-text">
                        {item.listing?.title ?? "Transaction"}
                      </p>
                      <p className="text-sm font-semibold text-brand-primary">
                        {formatUGX(item.agreed_price)}
                      </p>
                      {item.counterparty ? (
                        <p className="text-xs text-brand-muted">
                          With {item.counterparty.display_name}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/transactions/${item.id}`}
                      className="flex-1 rounded-lg bg-brand-primary py-2 text-center text-sm font-medium text-white"
                    >
                      Open deal
                    </Link>
                    <Link
                      href={`/transactions/${item.id}/chat`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-input px-3 py-2 text-sm font-medium text-brand-primary"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

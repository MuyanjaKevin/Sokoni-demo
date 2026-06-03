"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HandCoins,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { OfferTimeline } from "@/components/OfferTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_OFFER_ROUNDS, type OfferWithBuyer } from "@/lib/offers-shared";
import type { ListingWithSeller } from "@/lib/listings-data";
import { formatUGX } from "@/lib/utils";
import type { ApiResponse } from "@/types";

interface OfferWorkspaceProps {
  listing: ListingWithSeller;
  userId: string | null;
}

export function OfferWorkspace({
  listing,
  userId,
}: OfferWorkspaceProps): React.JSX.Element {
  const router = useRouter();
  const [offers, setOffers] = useState<OfferWithBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState("");
  const [counterPrice, setCounterPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSeller = userId === listing.seller_id;
  const isBuyer = userId !== null && !isSeller;

  const myOffer = useMemo(
    () => offers.find((offer) => offer.buyer_id === userId) ?? null,
    [offers, userId],
  );

  const sellerPendingOffers = useMemo(
    () => offers.filter((offer) => offer.status === "pending"),
    [offers],
  );

  const acceptedOffer = useMemo(
    () => offers.find((offer) => offer.status === "accepted") ?? null,
    [offers],
  );

  const loadOffers = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/offers?listing_id=${listing.id}`,
      );
      const result = (await response.json()) as ApiResponse<OfferWithBuyer[]>;

      if (!result.success) {
        toast.error(result.error ?? "Could not load offers");
        return;
      }

      setOffers(result.data ?? []);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [listing.id]);

  useEffect(() => {
    if (userId) {
      void loadOffers();
    } else {
      setLoading(false);
    }
  }, [loadOffers, userId]);

  async function sendOffer(): Promise<void> {
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid offer price");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          proposed_price: amount,
        }),
      });
      const result = (await response.json()) as ApiResponse<{ id: string }>;

      if (!result.success) {
        toast.error(result.error ?? "Could not send offer");
        return;
      }

      toast.success("Offer sent!");
      setPrice("");
      await loadOffers();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAction(
    offerId: string,
    action: "accept" | "counter" | "decline",
    counterAmount?: number,
  ): Promise<void> {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          proposed_price: counterAmount,
        }),
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
        toast.success("Offer accepted!");
        router.push(`/transactions/${result.data.transaction_id}`);
        return;
      }

      toast.success(
        action === "counter"
          ? "Counter sent"
          : action === "decline"
            ? "Offer declined"
            : "Done",
      );
      setCounterPrice("");
      await loadOffers();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const imageUrl = listing.photo_urls[0] ?? "/placeholder-listing.svg";

  if (!userId) {
    return (
      <Card className="rounded-xl border-0 shadow-md">
        <CardContent className="py-12 text-center">
          <p className="text-brand-muted">Sign in to make an offer</p>
          <Link
            href={`/login?next=/listings/${listing.id}/offer`}
            className="mt-4 inline-flex rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white"
          >
            Sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="80px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-semibold text-brand-text">
            {listing.title}
          </p>
          <p className="text-lg font-bold text-brand-primary">
            {formatUGX(listing.asking_price)}
          </p>
          <p className="text-xs text-brand-muted">Asking price</p>
        </div>
      </div>

      {acceptedOffer ? (
        <div className="rounded-xl border border-brand-success/30 bg-green-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-brand-success" />
            <div className="flex-1">
              <h3 className="font-semibold text-brand-success">Offer accepted</h3>
              <p className="mt-1 text-sm text-brand-text">
                Agreed at {formatUGX(acceptedOffer.proposed_price)}. Continue to
                secure payment.
              </p>
              <Link
                href={
                  acceptedOffer.transaction?.id
                    ? `/transactions/${acceptedOffer.transaction.id}`
                    : `/listings/${listing.id}`
                }
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md"
              >
                Proceed to payment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {isBuyer && !acceptedOffer ? (
        <Card className="rounded-xl border-0 shadow-md ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HandCoins className="h-5 w-5 text-brand-accent" />
              Your offer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!myOffer ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="offerPrice">Your price (UGX)</Label>
                  <Input
                    id="offerPrice"
                    type="number"
                    inputMode="numeric"
                    placeholder={String(Math.round(listing.asking_price * 0.9))}
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                  />
                  <p className="text-xs text-brand-muted">
                    Tip: start near {formatUGX(listing.asking_price)}
                  </p>
                </div>
                <Button
                  className="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/90"
                  disabled={submitting}
                  onClick={() => void sendOffer()}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send offer"
                  )}
                </Button>
              </>
            ) : null}

            {myOffer?.status === "countered" ? (
              <div className="space-y-3 rounded-lg bg-brand-accent/10 p-4">
                <p className="text-sm font-medium text-brand-text">
                  Seller countered at {formatUGX(myOffer.proposed_price)}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex-1 rounded-lg bg-brand-primary"
                    disabled={submitting}
                    onClick={() => void handleAction(myOffer.id, "accept")}
                  >
                    Accept counter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-lg"
                    disabled={submitting}
                    onClick={() => void handleAction(myOffer.id, "decline")}
                  >
                    Decline
                  </Button>
                </div>
                {myOffer.round < MAX_OFFER_ROUNDS ? (
                  <div className="space-y-2 border-t border-brand-accent/20 pt-3">
                    <Label htmlFor="buyerCounter">Your counter (UGX)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="buyerCounter"
                        type="number"
                        value={counterPrice}
                        onChange={(event) =>
                          setCounterPrice(event.target.value)
                        }
                      />
                      <Button
                        variant="outline"
                        disabled={submitting}
                        onClick={() => {
                          const amount = Number(counterPrice);
                          if (amount > 0) {
                            void handleAction(myOffer.id, "counter", amount);
                          }
                        }}
                      >
                        Counter
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {myOffer?.status === "pending" ? (
              <p className="rounded-lg bg-brand-background px-3 py-2 text-sm text-brand-muted">
                Waiting for seller response…
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {isSeller && !acceptedOffer ? (
        <div className="space-y-4">
          {sellerPendingOffers.length === 0 ? (
            <Card className="rounded-xl border-0 shadow-md">
              <CardContent className="py-8 text-center text-sm text-brand-muted">
                No pending offers yet. Share your listing to attract buyers.
              </CardContent>
            </Card>
          ) : (
            sellerPendingOffers.map((offer) => (
              <Card
                key={offer.id}
                className="rounded-xl border-0 shadow-md ring-1 ring-black/5"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Offer from {offer.buyer?.display_name ?? "Buyer"}
                  </CardTitle>
                  <p className="text-2xl font-bold text-brand-primary">
                    {formatUGX(offer.proposed_price)}
                  </p>
                  <p className="text-xs text-brand-muted">
                    Round {offer.round} of {MAX_OFFER_ROUNDS}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="rounded-lg bg-brand-primary"
                      disabled={submitting}
                      onClick={() => void handleAction(offer.id, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      disabled={submitting}
                      onClick={() => void handleAction(offer.id, "decline")}
                    >
                      Decline
                    </Button>
                  </div>
                  {offer.round < MAX_OFFER_ROUNDS ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Counter price"
                        value={counterPrice}
                        onChange={(event) =>
                          setCounterPrice(event.target.value)
                        }
                      />
                      <Button
                        variant="outline"
                        className="shrink-0 rounded-lg border-brand-accent text-brand-text"
                        disabled={submitting}
                        onClick={() => {
                          const amount = Number(counterPrice);
                          if (amount > 0) {
                            void handleAction(offer.id, "counter", amount);
                          }
                        }}
                      >
                        Counter
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-brand-text">
          Offer history
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
          </div>
        ) : (
          <OfferTimeline
            offers={offers}
            highlightOfferId={myOffer?.id}
          />
        )}
      </div>

      <Link
        href={`/listings/${listing.id}`}
        className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listing
      </Link>
    </div>
  );
}

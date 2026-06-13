"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Bike,
  Car,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { DemoBanner } from "@/components/DemoBanner";
import { TransactionStepper } from "@/components/TransactionStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionDetail } from "@/lib/transactions-data";
import { formatUGX } from "@/lib/utils";
import type { ApiResponse } from "@/types";

interface TransactionWorkspaceProps {
  transaction: TransactionDetail;
  userId: string;
}

export function TransactionWorkspace({
  transaction: initial,
  userId,
}: TransactionWorkspaceProps): React.JSX.Element {
  const router = useRouter();
  const [transaction, setTransaction] = useState(initial);
  const [paying, setPaying] = useState(false);
  const [acting, setActing] = useState(false);

  const isBuyer = userId === transaction.buyer_id;
  const isSeller = userId === transaction.seller_id;
  const listing = transaction.listing;
  const imageUrl = listing?.photo_urls[0] ?? "/placeholder-listing.svg";

  const fireConfetti = useCallback((): void => {
    void confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#1A6B3C", "#F4A623", "#FFFFFF"],
    });
  }, []);

  useEffect(() => {
    if (transaction.status === "completed") {
      fireConfetti();
    }
  }, [transaction.status, fireConfetti]);

  async function simulatePayment(): Promise<void> {
    setPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const response = await fetch(
        `/api/transactions/${transaction.id}/simulate-payment`,
        { method: "POST" },
      );
      const result = (await response.json()) as ApiResponse<{ status: string }>;

      if (!result.success) {
        toast.error(result.error ?? "Payment failed");
        return;
      }

      toast.success("Payment secured in escrow");
      setTransaction((prev) => ({ ...prev, status: "escrowed" }));
      router.refresh();
    } catch {
      toast.error("Payment failed");
    } finally {
      setPaying(false);
    }
  }

  async function dispatch(method: "safeboda" | "uber" | "meetup"): Promise<void> {
    setActing(true);
    try {
      const response = await fetch(
        `/api/transactions/${transaction.id}/dispatch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delivery_method: method }),
        },
      );
      const result = (await response.json()) as ApiResponse<{ status: string }>;

      if (!result.success) {
        toast.error(result.error ?? "Could not dispatch");
        return;
      }

      toast.success(`Marked as sent via ${method}`);
      setTransaction((prev) => ({ ...prev, status: "in_delivery" }));
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActing(false);
    }
  }

  async function confirmReceipt(): Promise<void> {
    setActing(true);
    try {
      const response = await fetch(
        `/api/transactions/${transaction.id}/confirm`,
        { method: "POST" },
      );
      const result = (await response.json()) as ApiResponse<{ status: string }>;

      if (!result.success) {
        toast.error(result.error ?? "Could not confirm");
        return;
      }

      toast.success("Transaction complete!");
      setTransaction((prev) => ({ ...prev, status: "completed" }));
      fireConfetti();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="space-y-6">
      <DemoBanner />

      <Card className="rounded-xl border-0 shadow-md ring-1 ring-black/5">
        <CardContent className="pt-6">
          <TransactionStepper status={transaction.status} />
        </CardContent>
      </Card>

      <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="64px" />
        </div>
        <div>
          <p className="font-semibold text-brand-text">
            {listing?.title ?? "Listing"}
          </p>
          <p className="text-xl font-bold text-brand-primary">
            {formatUGX(transaction.agreed_price)}
          </p>
          {listing?.district ? (
            <p className="flex items-center gap-1 text-xs text-brand-muted">
              <MapPin className="h-3 w-3" />
              {listing.district}
            </p>
          ) : null}
        </div>
      </div>

      {transaction.status === "completed" ? (
        <div className="rounded-xl border border-brand-success/30 bg-green-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-brand-success" />
          <h2 className="mt-3 text-xl font-bold text-brand-success">Complete</h2>
          <p className="mt-2 text-sm text-brand-text">
            {formatUGX(transaction.agreed_price)} confirmed. Thanks for trading on
            Sokoni.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href={`/ratings/${transaction.id}`}
              className="inline-flex rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-text"
            >
              Rate {isBuyer ? "seller" : "buyer"}
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white"
            >
              Back to marketplace
            </Link>
          </div>
        </div>
      ) : null}

      {transaction.status === "pending" && isBuyer ? (
        <Card className="overflow-hidden rounded-xl border-0 shadow-lg">
          <div className="bg-[#FFCC00] px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-black tracking-tight text-[#1a1a1a]">
                MTN MoMo
              </p>
              <Badge className="border-0 bg-black/80 text-white hover:bg-black/80">
                DEMO MODE
              </Badge>
            </div>
            <p className="text-xs font-medium text-black/70">
              Mobile Money · Uganda
            </p>
          </div>
          <CardContent className="space-y-4 bg-white pt-5">
            <div className="rounded-lg bg-brand-background p-4 text-center">
              <p className="text-sm text-brand-muted">Amount to pay</p>
              <p className="text-3xl font-bold text-brand-text">
                {formatUGX(transaction.agreed_price)}
              </p>
            </div>
            <p className="text-center text-xs text-brand-muted">
              Funds held in escrow until you confirm delivery
            </p>
            <Button
              className="h-12 w-full rounded-lg bg-[#FFCC00] text-base font-bold text-black hover:bg-[#e6b800]"
              disabled={paying}
              onClick={() => void simulatePayment()}
            >
              {paying ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing…
                </>
              ) : (
                "Confirm Payment (Demo)"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {transaction.status === "escrowed" && isSeller ? (
        <Card className="rounded-xl border-0 shadow-md ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-lg">Mark as dispatched</CardTitle>
            <p className="text-sm text-brand-muted">
              Payment is in escrow. Choose how you&apos;re delivering.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 rounded-xl py-4"
              disabled={acting}
              onClick={() => void dispatch("safeboda")}
            >
              <Bike className="h-6 w-6 text-brand-primary" />
              SafeBoda
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 rounded-xl py-4"
              disabled={acting}
              onClick={() => void dispatch("uber")}
            >
              <Car className="h-6 w-6 text-brand-primary" />
              Uber
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 rounded-xl py-4"
              disabled={acting}
              onClick={() => void dispatch("meetup")}
            >
              <Users className="h-6 w-6 text-brand-primary" />
              Meetup
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {transaction.status === "in_delivery" && isBuyer ? (
        <Card className="rounded-xl border-0 shadow-md ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-lg">Confirm delivery</CardTitle>
            <p className="text-sm text-brand-muted">
              Received your item? Release escrow to the seller.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 rounded-lg bg-brand-primary hover:bg-brand-primary/90"
              disabled={acting}
              onClick={() => void confirmReceipt()}
            >
              {acting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirm receipt"
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-lg border-brand-danger/30 text-brand-danger"
              disabled
            >
              Raise dispute (soon)
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {(transaction.status === "pending" && isSeller) ||
      (transaction.status === "escrowed" && isBuyer) ||
      (transaction.status === "in_delivery" && isSeller) ? (
        <p className="rounded-lg bg-brand-background px-4 py-3 text-center text-sm text-brand-muted">
          {transaction.status === "pending" && isSeller
            ? "Waiting for buyer payment…"
            : transaction.status === "escrowed" && isBuyer
              ? "Waiting for seller to dispatch…"
              : "Waiting for buyer to confirm receipt…"}
        </p>
      ) : null}

      <Link
        href={`/transactions/${transaction.id}/chat`}
        className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-brand-primary shadow-sm ring-1 ring-black/5 transition hover:bg-brand-primary/5"
      >
        <MessageCircle className="h-4 w-4" />
        Message {isBuyer ? "seller" : "buyer"}
      </Link>

      <p className="flex items-center justify-center gap-2 text-xs text-brand-muted">
        <Shield className="h-4 w-4 text-brand-success" />
        Escrow protected · State changes are audited
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { PurchaseRow } from "@/lib/profile-data";
import { formatUGX } from "@/lib/utils";

interface ProfileMeActionsProps {
  profileId: string;
}

export function ProfileMeActions({
  profileId,
}: ProfileMeActionsProps): React.JSX.Element {
  const router = useRouter();

  async function handleSignOut(): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Could not sign out");
      return;
    }

    toast.success("Signed out");
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/profile/${profileId}`}
        className="inline-flex rounded-lg border border-input px-3 py-2 text-sm font-medium text-brand-text hover:bg-brand-background"
      >
        Public view
      </Link>
      <Button
        type="button"
        variant="outline"
        className="gap-2 rounded-lg text-brand-danger hover:text-brand-danger"
        onClick={() => void handleSignOut()}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}

interface PurchaseListProps {
  purchases: PurchaseRow[];
}

export function PurchaseList({
  purchases,
}: PurchaseListProps): React.JSX.Element {
  if (purchases.length === 0) {
    return (
      <p className="rounded-xl bg-brand-background px-4 py-8 text-center text-sm text-brand-muted">
        No purchases yet. Browse listings to start buying.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {purchases.map((purchase) => {
        const imageUrl =
          purchase.listing?.photo_urls[0] ?? "/placeholder-listing.svg";

        return (
          <Link
            key={purchase.id}
            href={`/transactions/${purchase.id}`}
            className="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition hover:ring-brand-primary/20"
          >
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
              <p className="truncate font-medium text-brand-text">
                {purchase.listing?.title ?? "Purchase"}
              </p>
              <p className="text-sm font-semibold text-brand-primary">
                {formatUGX(purchase.agreed_price)}
              </p>
              <p className="text-xs capitalize text-brand-muted">
                {purchase.status.replace("_", " ")}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

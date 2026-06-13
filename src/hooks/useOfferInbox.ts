"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { InboxOfferItem } from "@/lib/offers-shared";
import type { ApiResponse } from "@/types";

interface UseOfferInboxResult {
  offers: InboxOfferItem[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useOfferInbox(profileId: string): UseOfferInboxResult {
  const supabase = useMemo(() => createClient(), []);
  const [offers, setOffers] = useState<InboxOfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffers = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/offers/inbox");
      const result = (await response.json()) as ApiResponse<InboxOfferItem[]>;

      if (!result.success) {
        setError(result.error ?? "Could not load offers");
        setOffers([]);
        return;
      }

      setOffers(result.data ?? []);
    } catch {
      setError("Network error");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    const channel = supabase
      .channel(`offer-inbox:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
        },
        () => {
          void loadOffers();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadOffers, profileId, supabase]);

  return { offers, loading, error, reload: () => void loadOffers() };
}

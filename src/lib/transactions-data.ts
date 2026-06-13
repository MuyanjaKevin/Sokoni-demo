import { createServerClient } from "@/lib/supabase/server";
import type { Escrow, Listing, Transaction } from "@/types";

export interface TransactionDetail extends Transaction {
  listing: Pick<
    Listing,
    "id" | "title" | "photo_urls" | "asking_price" | "district" | "category"
  > | null;
  escrow: Escrow | null;
}

export async function fetchTransactionById(
  id: string,
): Promise<TransactionDetail | null> {
  const admin = createServerClient();

  const { data, error } = await admin
    .from("transactions")
    .select(
      `
      *,
      listing:listings!listing_id (
        id,
        title,
        photo_urls,
        asking_price,
        district,
        category
      ),
      escrow (*)
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as TransactionDetail & { escrow: Escrow | Escrow[] | null };
  const escrowRaw = row.escrow;
  const escrow = Array.isArray(escrowRaw) ? escrowRaw[0] ?? null : escrowRaw;

  return { ...row, escrow };
}

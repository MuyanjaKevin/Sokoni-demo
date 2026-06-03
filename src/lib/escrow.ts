import { createServerClient } from "@/lib/supabase/server";
import type { EscrowState } from "@/types";

export const VALID_TRANSITIONS: Record<EscrowState, EscrowState[]> = {
  pending: ["held"],
  held: ["released", "refunded", "frozen"],
  frozen: ["released", "refunded"],
  released: [],
  refunded: [],
};

export async function transitionEscrow(
  transactionId: string,
  toState: EscrowState,
  actor: string,
  reason: string,
): Promise<void> {
  const admin = createServerClient();

  const { data: escrow, error: fetchError } = await admin
    .from("escrow")
    .select("id, state, amount")
    .eq("transaction_id", transactionId)
    .single();

  if (fetchError || !escrow) {
    throw new Error("Escrow record not found");
  }

  const fromState = escrow.state as EscrowState;
  const allowed = VALID_TRANSITIONS[fromState];

  if (!allowed.includes(toState)) {
    throw new Error(
      `Invalid escrow transition: ${fromState} → ${toState}`,
    );
  }

  const { error: updateError } = await admin
    .from("escrow")
    .update({
      state: toState,
      updated_at: new Date().toISOString(),
    })
    .eq("id", escrow.id);

  if (updateError) {
    throw new Error("Could not update escrow state");
  }

  const { error: logError } = await admin.from("escrow_logs").insert({
    transaction_id: transactionId,
    from_state: fromState,
    to_state: toState,
    actor,
    reason,
  });

  if (logError) {
    throw new Error("Could not write escrow audit log");
  }
}

export async function ensureEscrowRecord(
  transactionId: string,
  amount: number,
): Promise<void> {
  const admin = createServerClient();

  const { data: existing } = await admin
    .from("escrow")
    .select("id")
    .eq("transaction_id", transactionId)
    .maybeSingle();

  if (existing) {
    return;
  }

  const { error } = await admin.from("escrow").insert({
    transaction_id: transactionId,
    amount,
    state: "pending",
  });

  if (error) {
    throw new Error("Could not create escrow record");
  }
}

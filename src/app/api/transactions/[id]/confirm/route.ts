import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { transitionEscrow } from "@/lib/escrow";
import { createCookieClient } from "@/lib/supabase/cookie";
import { createServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(
  _request: Request,
  context: { params: { id: string } },
): Promise<Response> {
  try {
    const parsed = paramsSchema.safeParse(context.params);
    if (!parsed.success) {
      return jsonError("Invalid transaction");
    }

    const cookieClient = createCookieClient();
    const {
      data: { user },
    } = await cookieClient.auth.getUser();

    if (!user) {
      return jsonError("You must be signed in", 401);
    }

    const admin = createServerClient();
    const { data: transaction, error } = await admin
      .from("transactions")
      .select("id, buyer_id, status")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (error || !transaction) {
      return jsonError("Transaction not found", 404);
    }

    if (transaction.buyer_id !== user.id) {
      return jsonError("Only the buyer can confirm receipt", 403);
    }

    if (transaction.status !== "in_delivery") {
      return jsonError("Item must be in delivery before confirming");
    }

    await transitionEscrow(
      transaction.id,
      "released",
      user.id,
      "Buyer confirmed receipt",
    );

    const { error: updateError } = await admin
      .from("transactions")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) {
      return jsonError("Could not complete transaction", 500);
    }

    return jsonSuccess({ status: "completed" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not confirm";
    return jsonError(message, 500);
  }
}

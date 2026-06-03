import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createCookieClient } from "@/lib/supabase/cookie";
import { createServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({ id: z.string().uuid() });

const bodySchema = z.object({
  delivery_method: z.enum(["safeboda", "uber", "meetup"]),
});

export async function POST(
  request: Request,
  context: { params: { id: string } },
): Promise<Response> {
  try {
    const parsed = paramsSchema.safeParse(context.params);
    if (!parsed.success) {
      return jsonError("Invalid transaction");
    }

    const body: unknown = await request.json();
    const bodyParsed = bodySchema.safeParse(body);

    if (!bodyParsed.success) {
      return jsonError("Invalid delivery method");
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
      .select("id, seller_id, status")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (error || !transaction) {
      return jsonError("Transaction not found", 404);
    }

    if (transaction.seller_id !== user.id) {
      return jsonError("Only the seller can mark dispatch", 403);
    }

    if (transaction.status !== "escrowed") {
      return jsonError("Transaction is not ready for dispatch");
    }

    const { error: updateError } = await admin
      .from("transactions")
      .update({
        status: "in_delivery",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) {
      return jsonError("Could not update transaction", 500);
    }

    await admin.from("escrow_logs").insert({
      transaction_id: transaction.id,
      from_state: "held",
      to_state: "held",
      actor: user.id,
      reason: `Dispatched via ${bodyParsed.data.delivery_method}`,
    });

    return jsonSuccess({
      status: "in_delivery",
      delivery_method: bodyParsed.data.delivery_method,
    });
  } catch {
    return jsonError("Something went wrong", 500);
  }
}

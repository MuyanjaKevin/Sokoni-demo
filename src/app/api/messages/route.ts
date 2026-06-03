import { z } from "zod";
import { jsonError, jsonSuccess } from "@/lib/api";
import { createCookieClient } from "@/lib/supabase/cookie";
import { createServerClient } from "@/lib/supabase/server";

const querySchema = z.object({
  transaction_id: z.string().uuid(),
});

const createMessageSchema = z.object({
  transaction_id: z.string().uuid(),
  content: z.string().trim().min(1).max(1000),
});

async function assertParticipant(
  transactionId: string,
  userId: string,
): Promise<boolean> {
  const admin = createServerClient();
  const { data, error } = await admin
    .from("transactions")
    .select("buyer_id, seller_id")
    .eq("id", transactionId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return data.buyer_id === userId || data.seller_id === userId;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      transaction_id: searchParams.get("transaction_id"),
    });

    if (!parsed.success) {
      return jsonError("transaction_id is required");
    }

    const cookieClient = createCookieClient();
    const {
      data: { user },
    } = await cookieClient.auth.getUser();

    if (!user) {
      return jsonError("You must be signed in", 401);
    }

    const isParticipant = await assertParticipant(
      parsed.data.transaction_id,
      user.id,
    );

    if (!isParticipant) {
      return jsonError("You cannot view this conversation", 403);
    }

    const admin = createServerClient();
    const { data, error } = await admin
      .from("messages")
      .select(
        `
        *,
        sender:profiles!sender_id (
          id,
          display_name
        )
      `,
      )
      .eq("transaction_id", parsed.data.transaction_id)
      .order("created_at", { ascending: true });

    if (error) {
      return jsonError("Could not load messages", 500);
    }

    return jsonSuccess(data ?? []);
  } catch {
    return jsonError("Something went wrong", 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const cookieClient = createCookieClient();
    const {
      data: { user },
      error: userError,
    } = await cookieClient.auth.getUser();

    if (userError || !user) {
      return jsonError("You must be signed in", 401);
    }

    const body: unknown = await request.json();
    const parsed = createMessageSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Message must be between 1 and 1000 characters");
    }

    const isParticipant = await assertParticipant(
      parsed.data.transaction_id,
      user.id,
    );

    if (!isParticipant) {
      return jsonError("You cannot send messages in this conversation", 403);
    }

    const admin = createServerClient();
    const { data, error } = await admin
      .from("messages")
      .insert({
        transaction_id: parsed.data.transaction_id,
        sender_id: user.id,
        content: parsed.data.content,
      })
      .select(
        `
        *,
        sender:profiles!sender_id (
          id,
          display_name
        )
      `,
      )
      .single();

    if (error || !data) {
      return jsonError("Could not send message", 500);
    }

    return jsonSuccess(data, 201);
  } catch {
    return jsonError("Something went wrong", 500);
  }
}

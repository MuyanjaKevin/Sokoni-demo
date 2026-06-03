import { notFound, redirect } from "next/navigation";
import { ChatRoom } from "./ChatRoom";
import { createCookieClient } from "@/lib/supabase/cookie";
import { createServerClient } from "@/lib/supabase/server";
import { fetchTransactionById } from "@/lib/transactions-data";

interface ChatPageProps {
  params: { id: string };
}

export default async function ChatPage({
  params,
}: ChatPageProps): Promise<React.JSX.Element> {
  const supabase = createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/transactions/${params.id}/chat`);
  }

  const transaction = await fetchTransactionById(params.id).catch(() => null);

  if (!transaction) {
    notFound();
  }

  const isParticipant =
    user.id === transaction.buyer_id || user.id === transaction.seller_id;

  if (!isParticipant) {
    notFound();
  }

  const admin = createServerClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name")
    .in("id", [transaction.buyer_id, transaction.seller_id]);

  const participantNames: Record<string, string> = {};
  profiles?.forEach((profile) => {
    participantNames[profile.id] = profile.display_name;
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
      <ChatRoom
        transactionId={transaction.id}
        userId={user.id}
        listingTitle={transaction.listing?.title ?? "Transaction chat"}
        participantNames={participantNames}
      />
    </div>
  );
}

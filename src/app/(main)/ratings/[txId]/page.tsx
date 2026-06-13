import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RatingForm } from "./RatingForm";
import { createCookieClient } from "@/lib/supabase/cookie";
import { fetchRatingForTransaction } from "@/lib/profile-data";
import { createServerClient } from "@/lib/supabase/server";

interface RatingPageProps {
  params: { txId: string };
}

export default async function RatingPage({
  params,
}: RatingPageProps): Promise<React.JSX.Element> {
  const supabase = createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/ratings/${params.txId}`);
  }

  const admin = createServerClient();
  const { data: transaction } = await admin
    .from("transactions")
    .select("id, buyer_id, seller_id, status")
    .eq("id", params.txId)
    .maybeSingle();

  if (!transaction) {
    notFound();
  }

  const isParticipant =
    user.id === transaction.buyer_id || user.id === transaction.seller_id;

  if (!isParticipant) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-brand-muted">You cannot rate this transaction.</p>
        <Link href="/" className="mt-4 inline-block text-brand-primary hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  if (transaction.status !== "completed") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-brand-muted">
          You can rate this deal once the transaction is complete.
        </p>
        <Link
          href={`/transactions/${params.txId}`}
          className="mt-4 inline-block text-brand-primary hover:underline"
        >
          View transaction
        </Link>
      </div>
    );
  }

  const { rating, ratedProfile } = await fetchRatingForTransaction(
    params.txId,
    user.id,
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Leave a rating</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Help others trust sellers and buyers on Sokoni
        </p>
      </div>

      <RatingForm
        transactionId={params.txId}
        ratedName={ratedProfile?.display_name ?? "trader"}
        alreadyRated={Boolean(rating)}
      />
    </div>
  );
}

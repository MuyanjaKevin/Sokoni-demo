import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TransactionWorkspace } from "./TransactionWorkspace";
import { createCookieClient } from "@/lib/supabase/cookie";
import { fetchTransactionById } from "@/lib/transactions-data";

interface TransactionPageProps {
  params: { id: string };
}

export default async function TransactionPage({
  params,
}: TransactionPageProps): Promise<React.JSX.Element> {
  const supabase = createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/transactions/${params.id}`);
  }

  const transaction = await fetchTransactionById(params.id).catch(() => null);

  if (!transaction) {
    notFound();
  }

  const isParticipant =
    user.id === transaction.buyer_id || user.id === transaction.seller_id;

  if (!isParticipant) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-brand-muted">You do not have access to this transaction.</p>
        <Link href="/" className="mt-4 inline-block text-brand-primary hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Transaction</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Track payment, delivery, and completion
        </p>
      </div>
      <TransactionWorkspace transaction={transaction} userId={user.id} />
    </div>
  );
}

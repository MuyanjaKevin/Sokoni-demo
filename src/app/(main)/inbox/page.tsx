import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { fetchInboxForUser } from "@/lib/profile-data";
import { createCookieClient } from "@/lib/supabase/cookie";
import { formatUGX } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  escrowed: "Paid — awaiting dispatch",
  in_delivery: "In delivery",
};

export default async function InboxPage(): Promise<React.JSX.Element> {
  const supabase = createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/inbox");
  }

  const items = await fetchInboxForUser(user.id).catch(() => []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Inbox</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Active deals that need your attention
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="All caught up"
          description="No active transactions. Browse listings or check completed deals on your profile."
          actionLabel="Browse listings"
          actionHref="/search"
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const imageUrl =
              item.listing?.photo_urls[0] ?? "/placeholder-listing.svg";
            const role =
              item.buyer_id === user.id ? ("Buying" as const) : ("Selling" as const);

            return (
              <article
                key={item.id}
                className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex gap-3">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {role}
                      </Badge>
                      <Badge className="border-0 bg-brand-primary/10 text-[10px] text-brand-primary hover:bg-brand-primary/10">
                        {STATUS_LABELS[item.status] ?? item.status}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate font-medium text-brand-text">
                      {item.listing?.title ?? "Transaction"}
                    </p>
                    <p className="text-sm font-semibold text-brand-primary">
                      {formatUGX(item.agreed_price)}
                    </p>
                    {item.counterparty ? (
                      <p className="text-xs text-brand-muted">
                        With {item.counterparty.display_name}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/transactions/${item.id}`}
                    className="flex-1 rounded-lg bg-brand-primary py-2 text-center text-sm font-medium text-white"
                  >
                    Open deal
                  </Link>
                  <Link
                    href={`/transactions/${item.id}/chat`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-input px-3 py-2 text-sm font-medium text-brand-primary"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

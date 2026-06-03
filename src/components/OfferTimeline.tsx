import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn, formatUGX } from "@/lib/utils";
import type { OfferWithBuyer } from "@/lib/offers-shared";
import type { OfferStatus } from "@/types";

const STATUS_STYLES: Record<
  OfferStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800",
    icon: Clock,
  },
  countered: {
    label: "Countered",
    className: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-brand-success",
    icon: CheckCircle2,
  },
  declined: {
    label: "Declined",
    className: "bg-red-100 text-brand-danger",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    className: "bg-gray-100 text-brand-muted",
    icon: XCircle,
  },
};

interface OfferTimelineProps {
  offers: OfferWithBuyer[];
  highlightOfferId?: string;
}

export function OfferTimeline({
  offers,
  highlightOfferId,
}: OfferTimelineProps): React.JSX.Element {
  if (offers.length === 0) {
    return (
      <p className="text-sm text-brand-muted">No offers yet. Be the first to negotiate.</p>
    );
  }

  return (
    <ol className="relative space-y-4 border-l-2 border-brand-primary/20 pl-6">
      {offers.map((offer) => {
        const statusMeta = STATUS_STYLES[offer.status];
        const StatusIcon = statusMeta.icon;
        const isHighlight = offer.id === highlightOfferId;

        return (
          <li
            key={offer.id}
            className={cn(
              "relative rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5",
              isHighlight && "ring-2 ring-brand-primary/40",
            )}
          >
            <span className="absolute -left-[31px] top-5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary ring-4 ring-brand-background" />
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-brand-text">
                  {formatUGX(offer.proposed_price)}
                </p>
                <p className="text-xs text-brand-muted">
                  Round {offer.round} ·{" "}
                  {offer.buyer?.display_name ?? "Buyer"} ·{" "}
                  {new Date(offer.created_at).toLocaleString("en-UG", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusMeta.className,
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {statusMeta.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

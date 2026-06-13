import { Star } from "lucide-react";
import type { RatingWithRater } from "@/lib/ratings";

interface ReviewCardProps {
  review: RatingWithRater;
}

export function ReviewCard({ review }: ReviewCardProps): React.JSX.Element {
  const raterName = review.rater?.display_name ?? "Buyer";

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-brand-text">{raterName}</p>
          <p className="text-xs text-brand-muted">
            {new Date(review.created_at).toLocaleDateString("en-UG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < review.stars
                  ? "fill-brand-accent text-brand-accent"
                  : "text-brand-muted/30"
              }`}
            />
          ))}
        </div>
      </div>
      {review.review ? (
        <p className="mt-3 text-sm leading-relaxed text-brand-text">
          {review.review}
        </p>
      ) : null}
    </article>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StarRatingInput } from "@/components/StarRatingInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ApiResponse } from "@/types";

interface RatingFormProps {
  transactionId: string;
  ratedName: string;
  alreadyRated: boolean;
}

export function RatingForm({
  transactionId,
  ratedName,
  alreadyRated,
}: RatingFormProps): React.JSX.Element {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyRated);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: transactionId,
          stars,
          review: review.trim() || undefined,
        }),
      });

      const result = (await response.json()) as ApiResponse<unknown>;

      if (!result.success) {
        toast.error(result.error ?? "Could not submit rating");
        return;
      }

      toast.success("Thanks for your feedback!");
      setSubmitted(true);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="rounded-xl border-0 shadow-md ring-1 ring-black/5">
        <CardContent className="py-10 text-center">
          <p className="text-lg font-semibold text-brand-success">
            Rating submitted
          </p>
          <p className="mt-2 text-sm text-brand-muted">
            Your feedback helps build trust on Sokoni.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="inline-flex rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white"
            >
              Back to marketplace
            </Link>
            <Link
              href="/inbox"
              className="inline-flex rounded-lg border border-input px-4 py-2 text-sm font-medium text-brand-text"
            >
              View inbox
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-0 shadow-md ring-1 ring-black/5">
      <CardHeader>
        <CardTitle className="text-lg">Rate {ratedName}</CardTitle>
        <p className="text-sm text-brand-muted">
          How was your experience on this transaction?
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
          <div className="flex justify-center">
            <StarRatingInput value={stars} onChange={setStars} disabled={submitting} />
          </div>

          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium text-brand-text">
              Review (optional)
            </label>
            <Textarea
              id="review"
              value={review}
              onChange={(event) => setReview(event.target.value)}
              placeholder="Share details about delivery, communication, item condition…"
              maxLength={500}
              rows={4}
              disabled={submitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/90"
            disabled={submitting || stars < 1}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit rating"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps): React.JSX.Element {
  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={`Rate ${star} stars`}
          className={cn(
            "rounded p-1 transition hover:scale-110 disabled:opacity-50",
            disabled && "cursor-not-allowed",
          )}
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              "h-8 w-8",
              star <= value
                ? "fill-brand-accent text-brand-accent"
                : "text-brand-muted/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

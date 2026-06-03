import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-primary/20 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10">
        <Icon className="h-7 w-7 text-brand-primary" />
      </div>
      <h3 className="text-lg font-semibold text-brand-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-brand-primary px-4 text-sm font-medium text-white hover:bg-brand-primary/90"
        >
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          className="mt-6 rounded-lg bg-brand-primary hover:bg-brand-primary/90"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

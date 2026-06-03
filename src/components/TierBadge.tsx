import { cn } from "@/lib/utils";
import type { ProfileTier } from "@/types";

const TIER_STYLES: Record<ProfileTier, string> = {
  hustler: "bg-amber-900/90 text-amber-50",
  mover: "bg-blue-600/90 text-white",
  grinder: "bg-purple-600/90 text-white",
  elite: "bg-yellow-500/90 text-brand-text",
  legend: "bg-gradient-to-r from-slate-200 to-white text-brand-text ring-1 ring-slate-300",
};

const TIER_LABELS: Record<ProfileTier, string> = {
  hustler: "Hustler",
  mover: "Mover",
  grinder: "Grinder",
  elite: "Elite",
  legend: "Legend",
};

interface TierBadgeProps {
  tier: ProfileTier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        TIER_STYLES[tier],
        className,
      )}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}

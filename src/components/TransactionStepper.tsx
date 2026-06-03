import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionStatus } from "@/types";

const STEPS = [
  { key: "agreed", label: "Agreed" },
  { key: "payment", label: "Payment" },
  { key: "dispatched", label: "Dispatched" },
  { key: "received", label: "Received" },
  { key: "complete", label: "Complete" },
] as const;

function stepIndex(status: TransactionStatus): number {
  switch (status) {
    case "pending":
      return 1;
    case "escrowed":
      return 2;
    case "in_delivery":
      return 3;
    case "completed":
      return 4;
    case "disputed":
    case "refunded":
      return 2;
    default:
      return 0;
  }
}

interface TransactionStepperProps {
  status: TransactionStatus;
}

export function TransactionStepper({
  status,
}: TransactionStepperProps): React.JSX.Element {
  const activeIndex = stepIndex(status);

  return (
    <nav aria-label="Transaction progress" className="w-full">
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map((step, index) => {
          const isComplete = index < activeIndex || status === "completed";
          const isCurrent = index === activeIndex && status !== "completed";

          return (
            <li key={step.key} className="flex flex-1 flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isComplete && "bg-brand-primary text-white",
                  isCurrent && "bg-brand-accent text-brand-text ring-2 ring-brand-accent/50",
                  !isComplete && !isCurrent && "bg-brand-background text-brand-muted ring-1 ring-black/10",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-center text-[10px] font-medium sm:block",
                  isCurrent ? "text-brand-text" : "text-brand-muted",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong loading data.",
  onRetry,
}: ErrorStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-white px-6 py-14 text-center">
      <AlertCircle className="h-10 w-10 text-brand-danger" />
      <h3 className="mt-4 text-lg font-semibold text-brand-text">
        Could not load
      </h3>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">{message}</p>
      {onRetry ? (
        <Button
          variant="outline"
          className="mt-6 gap-2 rounded-lg"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

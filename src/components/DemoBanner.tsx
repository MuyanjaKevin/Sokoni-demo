import { DEMO_MODE } from "@/lib/auth";

export function DemoBanner(): React.JSX.Element | null {
  if (!DEMO_MODE) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-brand-accent/30 bg-brand-accent/15 px-4 py-2 text-center text-sm font-medium text-brand-text"
    >
      Demo mode — use code <span className="font-bold">123456</span>
    </div>
  );
}

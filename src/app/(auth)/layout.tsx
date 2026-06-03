import { DemoBanner } from "@/components/DemoBanner";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-brand-background">
      <DemoBanner />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}

import { MainNavbar } from "@/components/MainNavbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNavbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-black/5 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-brand-muted sm:px-6">
          <p className="font-medium text-brand-primary">Sokoni</p>
          <p className="mt-1">Buy and sell safely across Uganda</p>
        </div>
      </footer>
    </div>
  );
}

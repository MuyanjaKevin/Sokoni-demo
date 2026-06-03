import Link from "next/link";

export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-md rounded-xl bg-brand-surface p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-brand-primary">Sokoni</h1>
        <p className="mt-3 text-brand-muted">
          Peer-to-peer marketplace for Uganda
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-brand-primary px-4 text-sm font-medium text-white hover:bg-brand-primary/90"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}

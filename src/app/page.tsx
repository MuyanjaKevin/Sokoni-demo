export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-md rounded-xl bg-brand-surface p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-brand-primary">Sokoni</h1>
        <p className="mt-3 text-brand-muted">
          Peer-to-peer marketplace for Uganda. Complete Supabase setup to
          continue.
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OfferWorkspace } from "./OfferWorkspace";
import { createCookieClient } from "@/lib/supabase/cookie";
import { fetchListingById } from "@/lib/listings-data";
import { resolveProfileForUser } from "@/lib/profile-user";

interface OfferPageProps {
  params: { id: string };
}

export default async function OfferPage({
  params,
}: OfferPageProps): Promise<React.JSX.Element> {
  const listing = await fetchListingById(params.id).catch(() => null);

  if (!listing) {
    notFound();
  }

  if (listing.status !== "active") {
    redirect(`/listings/${params.id}`);
  }

  const supabase = createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await resolveProfileForUser(user) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-text">Negotiate</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Send an offer or respond as the seller
        </p>
      </div>

      <OfferWorkspace
        listing={listing}
        profileId={profile?.id ?? null}
      />

      {!user ? (
        <p className="mt-6 text-center text-sm text-brand-muted">
          <Link href="/login" className="font-medium text-brand-primary hover:underline">
            Sign in
          </Link>{" "}
          to start negotiating
        </p>
      ) : null}
    </div>
  );
}

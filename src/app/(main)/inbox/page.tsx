import { redirect } from "next/navigation";
import { InboxWorkspace } from "./InboxWorkspace";
import { fetchInboxForUser } from "@/lib/profile-data";
import { createCookieClient } from "@/lib/supabase/cookie";
import { resolveProfileForUser } from "@/lib/profile-user";

export default async function InboxPage(): Promise<React.JSX.Element> {
  const supabase = createCookieClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/inbox");
  }

  const profile = await resolveProfileForUser(user);

  if (!profile) {
    redirect("/profile-setup");
  }

  const deals = await fetchInboxForUser(profile.id, user.id).catch(() => []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-text">Inbox</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Offers and active deals update in real time
        </p>
      </div>

      <InboxWorkspace
        profileId={profile.id}
        authUserId={user.id}
        deals={deals}
      />
    </div>
  );
}

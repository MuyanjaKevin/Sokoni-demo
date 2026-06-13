"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidUgandaPhone, normalizeUgandaPhone } from "@/lib/auth";
import type { ApiResponse, Profile } from "@/types";

const DISTRICTS = [
  "Kampala",
  "Ntinda",
  "Kololo",
  "Bukoto",
  "Kawempe",
  "Entebbe",
  "Jinja",
  "Mbarara",
];

interface EditProfileFormProps {
  profile: Profile;
  embedded?: boolean;
}

export function EditProfileForm({
  profile,
  embedded = false,
}: EditProfileFormProps): React.JSX.Element {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [phone, setPhone] = useState(profile.phone);
  const [district, setDistrict] = useState(profile.district ?? DISTRICTS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2) {
      toast.error("Display name must be at least 2 characters");
      return;
    }

    const normalizedPhone = phone.startsWith("+256")
      ? phone.trim()
      : normalizeUgandaPhone(phone.replace(/^\+256/, ""));

    if (!isValidUgandaPhone(normalizedPhone)) {
      toast.error("Enter a valid Uganda phone (+256XXXXXXXXX)");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: trimmedName,
          district,
          phone: normalizedPhone,
        }),
      });

      const result = (await response.json()) as ApiResponse<Profile>;

      if (!result.success) {
        toast.error(result.error ?? "Could not save changes");
        return;
      }

      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      className={
        embedded
          ? "rounded-xl border-0 shadow-sm ring-1 ring-black/5"
          : "mt-6 rounded-xl border-0 shadow-sm ring-1 ring-black/5"
      }
    >
      {!embedded ? (
        <CardHeader>
          <CardTitle className="text-lg">Edit account</CardTitle>
          <p className="text-sm text-brand-muted">
            Update how others see you on Sokoni
          </p>
        </CardHeader>
      ) : null}
      <CardContent className={embedded ? "pt-6" : undefined}>
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editName">Display name</Label>
            <Input
              id="editName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={50}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editPhone">Phone number</Label>
            <Input
              id="editPhone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+256771234567"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editDistrict">District</Label>
            <select
              id="editDistrict"
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm"
            >
              {DISTRICTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            className="rounded-lg bg-brand-primary hover:bg-brand-primary/90"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

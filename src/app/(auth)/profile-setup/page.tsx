"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { ApiResponse } from "@/types";

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

export default function ProfileSetupPage(): React.JSX.Element {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [displayName, setDisplayName] = useState("");
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession(): Promise<void> {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setCheckingSession(false);
    }

    void checkSession();
  }, [router, supabase.auth]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      toast.error("Display name must be at least 2 characters");
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: trimmed, district }),
      });

      const result = (await response.json()) as ApiResponse<{
        redirectTo: string;
      }>;

      if (!result.success) {
        toast.error(result.error ?? "Could not save profile");
        return;
      }

      toast.success("Profile ready!");
      router.replace(result.data?.redirectTo ?? "/");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <p className="text-sm text-brand-muted">Checking your session…</p>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-xl border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl text-brand-primary">
          Set up your profile
        </CardTitle>
        <p className="text-sm text-brand-muted">
          Tell buyers and sellers who you are
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="e.g. Kevin"
              maxLength={50}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <select
              id="district"
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
            className="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/90"
            disabled={loading}
          >
            {loading ? "Saving…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

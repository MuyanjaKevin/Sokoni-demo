"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeUgandaPhone } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [digits, setDigits] = useState("");
  const [loading, setLoading] = useState(false);

  const phone = normalizeUgandaPhone(digits);
  const isValid = digits.length === 9;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!isValid || loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const result = (await response.json()) as ApiResponse<{
        message: string;
      }>;

      if (!result.success) {
        toast.error(result.error ?? "Could not send code");
        return;
      }

      toast.success(result.data?.message ?? "Code sent");
      router.push(`/login/verify?phone=${encodeURIComponent(phone)}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-xl border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-brand-primary">Sokoni</CardTitle>
        <p className="text-sm text-brand-muted">
          Enter your Uganda mobile number to sign in
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="flex overflow-hidden rounded-lg border border-input bg-white">
              <span className="flex items-center bg-brand-background px-3 text-sm font-medium text-brand-text">
                +256
              </span>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="771234567"
                maxLength={9}
                value={digits}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "").slice(0, 9);
                  setDigits(value);
                }}
                className="rounded-none border-0 focus-visible:ring-0"
                required
              />
            </div>
            <p className="text-xs text-brand-muted">9 digits after +256</p>
          </div>
          <Button
            type="submit"
            className="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/90"
            disabled={!isValid || loading}
          >
            {loading ? "Sending…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

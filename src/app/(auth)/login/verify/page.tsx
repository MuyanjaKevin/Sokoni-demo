"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidUgandaPhone } from "@/lib/auth";
import type { ApiResponse } from "@/types";

function OtpVerifyForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") ?? "";
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verify = useCallback(
    async (otp: string): Promise<void> => {
      if (loading || otp.length !== 6) {
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        });

        const result = (await response.json()) as ApiResponse<{
          redirectTo: string;
        }>;

        if (!result.success) {
          toast.error(result.error ?? "Verification failed");
          setDigits(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          return;
        }

        router.replace(result.data?.redirectTo ?? "/");
        router.refresh();
      } catch {
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [loading, phone, router],
  );

  useEffect(() => {
    if (!isValidUgandaPhone(phone)) {
      router.replace("/login");
    }
  }, [phone, router]);

  function handleChange(index: number, value: string): void {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const otp = next.join("");
    if (otp.length === 6 && next.every((d) => d !== "")) {
      void verify(otp);
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>): void {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) {
      return;
    }

    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(next);

    if (pasted.length === 6) {
      void verify(pasted);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-xl border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Enter verification code</CardTitle>
        <p className="text-sm text-brand-muted">
          Sent to <span className="font-medium text-brand-text">{phone}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              aria-label={`Digit ${index + 1}`}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="h-12 w-10 rounded-lg border border-input bg-white text-center text-lg font-semibold outline-none focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/30"
              disabled={loading}
            />
          ))}
        </div>
        <Button
          type="button"
          className="w-full rounded-lg bg-brand-primary hover:bg-brand-primary/90"
          disabled={loading || digits.join("").length !== 6}
          onClick={() => void verify(digits.join(""))}
        >
          {loading ? "Verifying…" : "Verify"}
        </Button>
        <p className="text-center text-sm text-brand-muted">
          <Link href="/login" className="text-brand-primary hover:underline">
            Change number
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-brand-muted">Loading verification…</div>
      }
    >
      <OtpVerifyForm />
    </Suspense>
  );
}

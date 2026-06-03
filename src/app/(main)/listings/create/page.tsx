"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LISTING_CATEGORIES, formatCondition } from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";
import { formatUGX } from "@/lib/utils";
import type { ListingCondition } from "@/types";
import type { ApiResponse } from "@/types";
import type { CloudinarySignedUpload } from "@/lib/cloudinary";

const CONDITIONS: ListingCondition[] = ["new", "like_new", "good", "fair"];

const DISTRICTS = [
  "Kampala",
  "Ntinda",
  "Kololo",
  "Bukoto",
  "Kawempe",
  "Entebbe",
];

export default function CreateListingPage(): React.JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [authChecked, setAuthChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [category, setCategory] = useState("fashion");
  const [condition, setCondition] = useState<ListingCondition>("good");
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkAuth(): Promise<void> {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login?next=/listings/create");
        return;
      }
      setAuthChecked(true);
    }
    void checkAuth();
  }, [router, supabase.auth]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const signResponse = await fetch("/api/media/signed-url", {
      method: "POST",
    });
    const signResult = (await signResponse.json()) as ApiResponse<CloudinarySignedUpload>;

    if (!signResult.success || !signResult.data) {
      toast.error(signResult.error ?? "Could not prepare upload");
      return null;
    }

    const { cloudName, apiKey, timestamp, signature, folder } = signResult.data;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );

    const uploadData = (await uploadResponse.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };

    if (!uploadResponse.ok || !uploadData.secure_url) {
      toast.error(uploadData.error?.message ?? "Upload failed");
      return null;
    }

    return uploadData.secure_url;
  }, []);

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const files = event.target.files;
    if (!files?.length || photoUrls.length >= 6) {
      return;
    }

    setUploading(true);

    try {
      const remaining = 6 - photoUrls.length;
      const toUpload = Array.from(files).slice(0, remaining);

      for (const file of toUpload) {
        const url = await uploadImage(file);
        if (url) {
          setPhotoUrls((prev) => [...prev, url]);
        }
      }
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removePhoto(index: number): void {
    setPhotoUrls((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const price = Number(askingPrice);
    if (!title.trim() || title.length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (photoUrls.length === 0) {
      toast.error("Add at least one photo");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          asking_price: price,
          category,
          condition,
          district,
          photo_urls: photoUrls,
        }),
      });

      const result = (await response.json()) as ApiResponse<{ id: string }>;

      if (!result.success || !result.data?.id) {
        toast.error(result.error ?? "Could not create listing");
        return;
      }

      toast.success("Listing published!");
      router.push(`/listings/${result.data.id}`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  const pricePreview = Number(askingPrice);
  const categories = LISTING_CATEGORIES.filter((item) => item.id !== "all");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">
          Sell on Sokoni
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Add photos, set your price, and reach buyers across Uganda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-xl border-0 shadow-md ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-lg">Photos</CardTitle>
            <p className="text-sm text-brand-muted">Up to 6 images</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photoUrls.map((url, index) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-black/10"
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photoUrls.length < 6 ? (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-brand-primary/30 bg-brand-primary/5 transition hover:border-brand-primary hover:bg-brand-primary/10">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
                  ) : (
                    <>
                      <ImagePlus className="h-6 w-6 text-brand-primary" />
                      <span className="mt-1 text-[10px] font-medium text-brand-primary">
                        Add
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => void handleFiles(event)}
                    disabled={uploading}
                  />
                </label>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-md ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. iPhone 13 Pro 256GB"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Condition, extras, reason for selling…"
                rows={4}
                maxLength={2000}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Asking price (UGX)</Label>
                <Input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  value={askingPrice}
                  onChange={(event) => setAskingPrice(event.target.value)}
                  placeholder="500000"
                  required
                />
                {pricePreview > 0 ? (
                  <p className="text-xs text-brand-muted">
                    Preview: {formatUGX(pricePreview)}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => value && setCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={condition}
                  onValueChange={(value) => {
                    if (value) {
                      setCondition(value as ListingCondition);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {formatCondition(item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Select
                  value={district}
                  onValueChange={(value) => value && setDistrict(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            className="flex-1 rounded-lg bg-brand-primary hover:bg-brand-primary/90"
            disabled={submitting || uploading}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish listing"
            )}
          </Button>
          <Link
            href="/"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-input bg-white px-4 py-2 text-sm font-medium hover:bg-brand-background"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

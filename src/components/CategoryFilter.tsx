"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Gamepad2,
  LayoutGrid,
  Shirt,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LISTING_CATEGORIES } from "@/lib/listings";

const ICONS: Record<string, LucideIcon> = {
  "layout-grid": LayoutGrid,
  shirt: Shirt,
  smartphone: Smartphone,
  "gamepad-2": Gamepad2,
};

interface CategoryFilterProps {
  basePath?: string;
}

export function CategoryFilter({
  basePath = "/",
}: CategoryFilterProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {LISTING_CATEGORIES.map((category) => {
        const Icon = ICONS[category.icon] ?? LayoutGrid;
        const isActive = active === category.id;
        const params = new URLSearchParams(searchParams.toString());

        if (category.id === "all") {
          params.delete("category");
        } else {
          params.set("category", category.id);
        }

        const href = params.toString()
          ? `${basePath}?${params.toString()}`
          : basePath;

        return (
          <Link
            key={category.id}
            href={href}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
              isActive
                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                : "bg-white text-brand-muted ring-1 ring-black/5 hover:text-brand-primary hover:ring-brand-primary/30",
            )}
          >
            <Icon className="h-4 w-4" />
            {category.label}
          </Link>
        );
      })}
    </div>
  );
}

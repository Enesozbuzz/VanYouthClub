"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type FilterCategory = { id: string; name: string; slug: string };

export function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: FilterCategory[];
  activeSlug?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const select = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("kategori", slug);
    } else {
      params.delete("kategori");
    }
    const query = params.toString();
    router.push(`/events${query ? `?${query}` : ""}`);
  };

  const chip = (active: boolean) =>
    cn(
      "badge cursor-pointer transition",
      active
        ? "border-acid/40 bg-acid/15 text-acid"
        : "hover:border-white/25 hover:text-white",
    );

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Kategori filtresi">
      <button
        type="button"
        onClick={() => select()}
        className={chip(!activeSlug)}
        aria-pressed={!activeSlug}
      >
        Tümü
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => select(category.slug)}
          className={chip(activeSlug === category.slug)}
          aria-pressed={activeSlug === category.slug}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

export type GalleryItem = {
  id: string;
  imageUrl: string;
  altText: string;
  title: string | null;
};

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, close]);

  const active = activeIndex === null ? null : items[activeIndex];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${item.title ?? item.altText} görselini büyüt`}
              className="group relative block w-full overflow-hidden rounded-xl border border-white/10 transition hover:border-acid/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.altText}
                loading="lazy"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
              {item.title && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2 text-left text-xs font-medium text-white">
                  {item.title}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Görsel önizleme"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <figure className="max-w-4xl" onClick={(event) => event.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.imageUrl}
              alt={active.altText}
              className="max-h-[80vh] w-auto rounded-xl"
            />
            <figcaption className="mt-3 text-center text-sm text-zinc-300">
              {active.title ?? active.altText}
            </figcaption>
          </figure>
          <button
            type="button"
            onClick={close}
            className="btn-secondary btn-sm absolute right-4 top-4"
          >
            Kapat
          </button>
        </div>
      )}
    </>
  );
}

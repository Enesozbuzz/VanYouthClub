import { Suspense } from "react";
import type { Metadata } from "next";
import { getActiveCategories, getUpcomingEvents } from "@/lib/queries";
import { EventCard } from "@/components/event-card";
import { CategoryFilter } from "@/components/category-filter";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Etkinlikler",
  description:
    "VAN YOUTH CLUB takvimindeki yaklaşan sosyal, kültürel ve sportif etkinlikleri keşfet. Kategorilere göre filtrele, detayları gör.",
};

export const revalidate = 60;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  const [events, categories] = await Promise.all([
    getUpcomingEvents(kategori),
    getActiveCategories(),
  ]);

  const activeCategory = categories.find((category) => category.slug === kategori);

  return (
    <div className="section">
      <div className="container-page">
        <p className="eyebrow">Etkinlikler</p>
        <h1 className="h-section">Yaklaşan Etkinlikler</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Kamp, oyun geceleri, akustik performanslar, geziler ve daha fazlası.
          Kategori seçerek takvimi filtreleyebilirsin.
        </p>

        <div className="mt-8">
          <Suspense fallback={null}>
            <CategoryFilter categories={categories} activeSlug={kategori} />
          </Suspense>
        </div>

        {activeCategory && (
          <p className="mt-4 text-sm text-zinc-400">
            Filtre:{" "}
            <strong className="font-semibold text-white">
              {activeCategory.name}
            </strong>
          </p>
        )}

        <div className="mt-6">
          {events.length === 0 ? (
            <EmptyState
              title="Henüz yayınlanmış etkinlik bulunmuyor."
              description="Bu kategoride şu anda planlanmış bir etkinlik yok. Yeni etkinlikler eklendiğinde burada görünecek."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

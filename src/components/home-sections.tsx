import Link from "next/link";
import { EventCard } from "./event-card";
import { Badge, ButtonLink, EmptyState } from "./ui";
import type { EventWithCategory } from "@/lib/queries";
import type { GalleryItem } from "./gallery-grid";
import { GalleryGrid } from "./gallery-grid";
import { phoneToTel, phoneToWhatsApp, type SiteSettings } from "@/lib/settings";

/* -------------------------------- Hero ------------------------------- */

export function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden border-b border-white/5">
      <div className="container-page flex flex-col items-start gap-8 py-20 sm:py-28">
        <Badge tone="acid" className="animate-fade-up">
          VAN · GENÇLİK · TOPLULUK
        </Badge>
        <h1 className="animate-fade-up max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          VAN YOUTH{" "}
          <span className="bg-gradient-to-r from-acid via-flame to-viola bg-clip-text text-transparent">
            CLUB
          </span>
        </h1>
        <p className="animate-fade-up max-w-xl text-lg leading-relaxed text-zinc-300">
          Van&apos;daki gençleri sosyal, kültürel, sportif ve topluluk odaklı
          etkinliklerde buluşturan platform.
        </p>
        <div className="animate-fade-up flex flex-wrap gap-3">
          <ButtonLink href="/events">Etkinlikleri Keşfet</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Bize Ulaş
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- Upcoming events -------------------------- */

export function UpcomingEvents({
  events,
  title = "Yaklaşan Etkinlikler",
}: {
  events: EventWithCategory[];
  title?: string;
}) {
  return (
    <section className="section">
      <div className="container-page">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Takvim</p>
            <h2 className="h-section">{title}</h2>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-acid hover:underline"
          >
            Tüm etkinlikler →
          </Link>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="Henüz yayınlanmış etkinlik bulunmuyor."
            description="Yeni etkinlikler duyurulduğunda burada listelenecek. Bize ulaşarak etkinlik önerinde bulunabilirsin."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------- Categories ----------------------------- */

export function CategoryStrip({
  categories,
}: {
  categories: Array<{ id: string; name: string; slug: string }>;
}) {
  if (categories.length === 0) return null;

  return (
    <section className="border-y border-white/5 bg-white/[0.02] py-12">
      <div className="container-page">
        <p className="eyebrow">Kategoriler</p>
        <h2 className="h-section mb-8">Neler Yapıyoruz?</h2>
        <ul className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/events?kategori=${category.slug}`}
                className="card card-hover inline-flex px-5 py-3 text-sm font-semibold text-zinc-200 hover:text-acid"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------- About ------------------------------- */

export function AboutTeaser() {
  return (
    <section className="section">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Hakkımızda</p>
          <h2 className="h-section">
            Gençleri bir araya getiren bir topluluk
          </h2>
          <p className="mt-4 text-muted">
            VAN YOUTH CLUB, Van&apos;daki gençlerin sosyal, kültürel ve sportif
            etkinlikler aracılığıyla buluştuğu bir topluluktur. Kamp,
            akustik geceler, oyun geceleri, geziler ve atölyelerle dolu bir
            takvim sunuyoruz.
          </p>
          <p className="mt-3 text-muted">
            Amacımız basit: gençlerin yeni insanlarla tanıştığı, birlikte
            deneyimlediği ve keyifli vakit geçirdiği bir ortam yaratmak.
          </p>
          <div className="mt-6">
            <ButtonLink href="/about" variant="secondary">
              Daha Fazla Bilgi
            </ButtonLink>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Etkinlik", value: "Sosyal & Kültürel" },
            { label: "Topluluk", value: "Genç & Dinamik" },
            { label: "Deneyim", value: "Kamp & Gezi" },
            { label: "Eğlence", value: "Game Night" },
          ].map((tile) => (
            <div key={tile.label} className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-acid">
                {tile.label}
              </p>
              <p className="mt-2 text-lg font-bold text-white">{tile.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Gallery ------------------------------ */

export function GalleryTeaser({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="section border-t border-white/5">
      <div className="container-page">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Galeri</p>
            <h2 className="h-section">Etkinliklerden Kareler</h2>
          </div>
          <Link
            href="/gallery"
            className="text-sm font-semibold text-acid hover:underline"
          >
            Tüm galeri →
          </Link>
        </div>
        <GalleryGrid items={items.slice(0, 8)} />
      </div>
    </section>
  );
}

/* ------------------------------ Contact ------------------------------ */

export function ContactCta({ settings }: { settings: SiteSettings }) {
  return (
    <section className="section">
      <div className="container-page">
        <div className="hero-glow card flex flex-col items-start gap-6 p-8 sm:p-12">
          <p className="eyebrow">Katılım</p>
          <h2 className="h-section max-w-2xl">
            Etkinliklere katılmak veya bize ulaşmak ister misin?
          </h2>
          <p className="max-w-xl text-muted">
            Etkinlik detay sayfalarındaki iletişim seçeneklerini kullanabilir
            veya doğrudan bize ulaşabilirsin. Sorularını ve önerilerini
            bekliyoruz.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={phoneToWhatsApp(settings.phone_1)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              WhatsApp&apos;tan Yaz
            </a>
            <a href={phoneToTel(settings.phone_1)} className="btn-secondary">
              {settings.phone_1}
            </a>
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

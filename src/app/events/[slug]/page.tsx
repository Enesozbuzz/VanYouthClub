import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ButtonLink, EmptyState } from "@/components/ui";
import { EventCard } from "@/components/event-card";
import { getEventBySlug, getRelatedEvents } from "@/lib/queries";
import { getSettings, phoneToTel, phoneToWhatsApp } from "@/lib/settings";
import { formatFullDate, formatTime } from "@/lib/utils";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Etkinlik bulunamadı" };
  return {
    title: event.title,
    description: event.description.slice(0, 155),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 155),
      type: "article",
      ...(event.coverImageUrl ? { images: [event.coverImageUrl] } : {}),
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const [settings, related] = await Promise.all([
    getSettings(),
    getRelatedEvents(event.id, event.categoryId),
  ]);

  const isCompleted = event.status === "COMPLETED";

  return (
    <article className="section">
      <div className="container-page">
        <Link
          href="/events"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-acid"
        >
          ← Tüm etkinlikler
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
              {event.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="aspect-[16/9] w-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="hero-glow flex aspect-[16/9] w-full items-center justify-center text-6xl font-black text-white/10"
                >
                  VY
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge tone="acid">{event.category.name}</Badge>
              {isCompleted && <Badge tone="neutral">Tamamlandı</Badge>}
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {event.title}
            </h1>

            <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-zinc-300">
              {event.description}
            </p>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white">Etkinlik Bilgileri</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-zinc-500">Tarih</dt>
                  <dd className="mt-0.5 font-medium text-white">
                    {formatFullDate(event.startAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Saat</dt>
                  <dd className="mt-0.5 font-medium text-white">
                    {formatTime(event.startAt)} – {formatTime(event.endAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Konum</dt>
                  <dd className="mt-0.5 font-medium text-white">{event.location}</dd>
                </div>
                {event.capacity !== null && (
                  <div>
                    <dt className="text-zinc-500">Kapasite</dt>
                    <dd className="mt-0.5 font-medium text-white">
                      {event.capacity} kişi
                    </dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="text-sm font-semibold text-white">Katılım / İletişim</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Katılım ve detaylı bilgi için bize ulaşabilirsin.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={phoneToWhatsApp(settings.phone_1)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    WhatsApp&apos;tan Yaz
                  </a>
                  <a href={phoneToTel(settings.phone_1)} className="btn-secondary">
                    Ara: {settings.phone_1}
                  </a>
                  {settings.phone_2 && (
                    <a href={phoneToTel(settings.phone_2)} className="btn-secondary">
                      Ara: {settings.phone_2}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="h-section mb-6 text-2xl">Benzer Etkinlikler</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <EventCard key={item.id} event={item} />
              ))}
            </div>
          </section>
        )}

        {related.length === 0 && (
          <div className="mt-16">
            <EmptyState
              title="Başka yaklaşan etkinlik yok"
              description="Bu kategoride yeni etkinlikler eklendiğinde burada listelenecek."
              action={
                <ButtonLink href="/events" variant="secondary" className="mt-2">
                  Tüm Etkinlikler
                </ButtonLink>
              }
            />
          </div>
        )}
      </div>
    </article>
  );
}

import Link from "next/link";
import { Badge } from "./ui";
import { formatShortDate, formatTime } from "@/lib/utils";
import type { EventWithCategory } from "@/lib/queries";

export function EventCard({ event }: { event: EventWithCategory }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImageUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="hero-glow flex h-full w-full items-center justify-center text-4xl font-black text-white/15"
          >
            VY
          </div>
        )}
        <span className="absolute left-3 top-3">
          <Badge tone="acid">{event.category.name}</Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-acid">
          {formatShortDate(event.startAt)} · {formatTime(event.startAt)}
        </p>
        <h3 className="text-lg font-bold text-white transition group-hover:text-acid">
          {event.title}
        </h3>
        <p className="line-clamp-2 text-sm text-zinc-400">{event.description}</p>
        <p className="mt-auto flex items-center gap-1.5 pt-3 text-xs text-zinc-500">
          <span aria-hidden="true">📍</span>
          {event.location}
        </p>
      </div>
    </Link>
  );
}

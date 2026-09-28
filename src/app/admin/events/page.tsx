import Link from "next/link";
import { Badge, ButtonLink, EmptyState } from "@/components/ui";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAllEventsAdmin } from "@/lib/queries";
import { formatShortDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  DRAFT: "neutral",
  PUBLISHED: "acid",
  CANCELLED: "flame",
  COMPLETED: "azure",
} as const;

const STATUS_LABEL = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
  CANCELLED: "İptal",
  COMPLETED: "Tamamlandı",
} as const;

export default async function AdminEventsPage() {
  const events = await getAllEventsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Etkinlikler</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Etkinlik oluştur, düzenle, yayınla ve sil.
          </p>
        </div>
        <ButtonLink href="/admin/events/new">Yeni Etkinlik</ButtonLink>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="Henüz etkinlik yok"
          description="İlk etkinliğini oluşturarak başla."
          action={
            <ButtonLink href="/admin/events/new" className="mt-2">
              Yeni Etkinlik
            </ButtonLink>
          }
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-3">Başlık</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Tarih</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="font-medium text-white hover:text-acid"
                    >
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-400">{event.category.name}</td>
                  <td className="px-5 py-3 text-zinc-400">
                    {formatShortDate(event.startAt)} · {formatTime(event.startAt)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[event.status]}>
                      {STATUS_LABEL[event.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="btn-secondary btn-sm"
                      >
                        Düzenle
                      </Link>
                      <DeleteButton
                        endpoint={`/api/admin/events/${event.id}`}
                        confirmMessage={`"${event.title}" etkinliğini silmek istediğine emin misin? Bu işlem geri alınamaz.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

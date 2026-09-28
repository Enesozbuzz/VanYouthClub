import { notFound } from "next/navigation";
import { getAllCategoriesAdmin, getEventByIdAdmin } from "@/lib/queries";
import { EventForm } from "@/components/admin/event-form";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params;
  const [event, categories] = await Promise.all([
    getEventByIdAdmin(id),
    getAllCategoriesAdmin(),
  ]);

  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Etkinliği Düzenle</h2>
        <p className="mt-1 text-sm text-zinc-400">{event.title}</p>
      </div>

      <EventForm
        mode="edit"
        categories={categories}
        initial={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description,
          categoryId: event.categoryId,
          location: event.location,
          startAt: event.startAt,
          endAt: event.endAt,
          capacity: event.capacity,
          coverImageUrl: event.coverImageUrl,
          status: event.status,
        }}
      />
    </div>
  );
}

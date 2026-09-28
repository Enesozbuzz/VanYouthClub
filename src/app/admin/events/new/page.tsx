import { getAllCategoriesAdmin } from "@/lib/queries";
import { EventForm } from "@/components/admin/event-form";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Yeni Etkinlik</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Etkinlik bilgilerini doldur ve kaydet.
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-flame">
          Önce en az bir kategori oluşturmalısın.{" "}
          <a href="/admin/categories" className="underline">
            Kategorilere git
          </a>
        </p>
      ) : (
        <EventForm mode="create" categories={categories} />
      )}
    </div>
  );
}

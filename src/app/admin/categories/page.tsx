import { getAllCategoriesAdmin } from "@/lib/queries";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Kategoriler</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Kategori ekle, düzenle, aktif/pasif yap ve sırala.
        </p>
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}

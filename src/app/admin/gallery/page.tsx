import { getAllGalleryAdmin } from "@/lib/queries";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const images = await getAllGalleryAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Galeri</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Etkinlik fotoğraflarını yükle ve yönet.
        </p>
      </div>

      <GalleryManager images={images} />
    </div>
  );
}

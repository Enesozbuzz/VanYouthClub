import type { Metadata } from "next";
import { getActiveGallery } from "@/lib/queries";
import { GalleryGrid } from "@/components/gallery-grid";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Galeri",
  description:
    "VAN YOUTH CLUB etkinliklerinden kareler — kamplar, akustik geceler, geziler ve daha fazlası.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const gallery = await getActiveGallery();

  return (
    <div className="section">
      <div className="container-page">
        <p className="eyebrow">Galeri</p>
        <h1 className="h-section">Etkinliklerden Kareler</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Etkinliklerimizden ve topluluk buluşmalarımızdan kareler.
        </p>

        <div className="mt-8">
          {gallery.length === 0 ? (
            <EmptyState
              title="Galeri henüz boş"
              description="Etkinlik fotoğrafları eklendiğinde burada görünecek."
            />
          ) : (
            <GalleryGrid items={gallery} />
          )}
        </div>
      </div>
    </div>
  );
}

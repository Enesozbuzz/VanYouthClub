import Link from "next/link";
import { getDashboardStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Toplam Etkinlik", value: stats.totalEvents, href: "/admin/events" },
    { label: "Yayındaki Etkinlik", value: stats.publishedEvents, href: "/admin/events" },
    { label: "Yaklaşan Etkinlik", value: stats.upcomingEvents, href: "/admin/events" },
    { label: "Kategori", value: stats.categories, href: "/admin/categories" },
    { label: "Galeri Görseli", value: stats.galleryImages, href: "/admin/gallery" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Platformun genel durumu.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="card card-hover p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-white">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="text-base font-bold text-white">Hızlı İşlemler</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/events/new" className="btn-primary btn-sm">
            Yeni Etkinlik
          </Link>
          <Link href="/admin/categories" className="btn-secondary btn-sm">
            Kategoriler
          </Link>
          <Link href="/admin/gallery" className="btn-secondary btn-sm">
            Galeri
          </Link>
          <Link href="/admin/settings" className="btn-secondary btn-sm">
            Site Ayarları
          </Link>
        </div>
      </div>
    </div>
  );
}

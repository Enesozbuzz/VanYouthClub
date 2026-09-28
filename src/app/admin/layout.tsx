import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = {
  title: "Yönetim Paneli",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side guard: every /admin page requires a valid session.
  await requireAdmin();

  return (
    <div className="section">
      <div className="container-page">
        <div className="mb-8">
          <p className="eyebrow">Yönetim</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            VAN YOUTH CLUB Paneli
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[210px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <AdminNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

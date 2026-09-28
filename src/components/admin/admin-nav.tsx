"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/events", label: "Etkinlikler" },
  { href: "/admin/categories", label: "Kategoriler" },
  { href: "/admin/gallery", label: "Galeri" },
  { href: "/admin/settings", label: "Site Ayarları" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Yönetim menüsü" className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                active
                  ? "bg-acid/15 text-acid"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Button variant="secondary" onClick={logout} loading={loading}>
        Çıkış Yap
      </Button>

      <Link
        href="/"
        className="text-xs text-zinc-500 transition hover:text-zinc-300"
      >
        ← Siteyi görüntüle
      </Link>
    </div>
  );
}

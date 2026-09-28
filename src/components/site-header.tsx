"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "./ui";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/events", label: "Etkinlikler" },
  { href: "/about", label: "Hakkımızda" },
  { href: "/gallery", label: "Galeri" },
  { href: "/contact", label: "İletişim" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/85 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setMenuOpen(false)}
          aria-label="VAN YOUTH CLUB ana sayfa"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-acid text-sm font-black text-ink-950"
          >
            VY
          </span>
          <span className="text-sm font-extrabold leading-tight tracking-wide text-white sm:text-base">
            VAN YOUTH CLUB
          </span>
        </Link>

        <nav aria-label="Ana menü" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                isActive(pathname, item.href)
                  ? "bg-white/10 text-acid"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <ButtonLink href="/events" className="btn-sm">
            Etkinlikleri Keşfet
          </ButtonLink>
        </div>

        <button
          type="button"
          className="btn-ghost md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobil menü"
          className="border-t border-white/10 bg-ink-900 md:hidden"
        >
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(pathname, item.href)
                    ? "bg-white/10 text-acid"
                    : "text-zinc-300 hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            >
              Yönetim Paneli
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

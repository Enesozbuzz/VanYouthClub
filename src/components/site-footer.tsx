import Link from "next/link";
import {
  phoneToTel,
  phoneToWhatsApp,
  type SiteSettings,
} from "@/lib/settings";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-acid text-sm font-black text-ink-950"
            >
              VY
            </span>
            <span className="text-sm font-extrabold tracking-wide text-white">
              VAN YOUTH CLUB
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-zinc-400">
            {settings.site_description}
          </p>
        </div>

        <nav aria-label="Alt menü">
          <h2 className="text-sm font-semibold text-white">Keşfet</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { href: "/events", label: "Etkinlikler" },
              { href: "/about", label: "Hakkımızda" },
              { href: "/gallery", label: "Galeri" },
              { href: "/contact", label: "İletişim" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-zinc-400 hover:text-acid">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-white">İletişim</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={phoneToTel(settings.phone_1)} className="text-zinc-400 hover:text-acid">
                {settings.phone_1}
              </a>
            </li>
            <li>
              <a href={phoneToTel(settings.phone_2)} className="text-zinc-400 hover:text-acid">
                {settings.phone_2}
              </a>
            </li>
            <li>
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-acid"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Hızlı İletişim</h2>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={phoneToWhatsApp(settings.phone_1)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-sm">
              WhatsApp&apos;tan Yaz
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-5">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-zinc-500 sm:flex-row">
          <p>
            © {year} VAN YOUTH CLUB — Van&apos;ın gençlik etkinlik platformu.
          </p>
          <Link href="/admin" className="hover:text-zinc-300">
            Yönetim Paneli
          </Link>
        </div>
      </div>
    </footer>
  );
}

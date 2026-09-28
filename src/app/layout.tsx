import type { Metadata } from "next";
import "@fontsource-variable/inter";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const siteUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VAN YOUTH CLUB — Van'ın gençlik etkinlik platformu",
    template: "%s | VAN YOUTH CLUB",
  },
  description:
    "Van'daki gençleri sosyal, kültürel, sportif ve topluluk etkinliklerinde buluşturan platform.",
  keywords: [
    "Van",
    "gençlik",
    "etkinlik",
    "topluluk",
    "VanYouthClub",
    "kamp",
    "gezi",
    "game night",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "VAN YOUTH CLUB",
    title: "VAN YOUTH CLUB — Van'ın gençlik etkinlik platformu",
    description:
      "Van'daki gençleri sosyal, kültürel, sportif ve topluluk etkinliklerinde buluşturan platform.",
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  return (
    <html lang="tr">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-acid focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-950"
        >
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { getSettings, phoneToTel, phoneToWhatsApp } from "@/lib/settings";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "VAN YOUTH CLUB ile iletişime geç — telefon, WhatsApp ve Instagram üzerinden bize ulaşabilirsin.",
};

export default async function ContactPage() {
  const settings = await getSettings();

  const channels = [
    {
      title: "Telefon",
      description: "Bizi doğrudan arayabilirsin.",
      items: [settings.phone_1, settings.phone_2],
      href: (phone: string) => phoneToTel(phone),
      cta: "Ara",
    },
    {
      title: "WhatsApp",
      description: "Hızlı ulaşmak için WhatsApp'tan yaz.",
      items: [settings.phone_1, settings.phone_2],
      href: (phone: string) => phoneToWhatsApp(phone),
      cta: "Mesaj Gönder",
    },
  ];

  return (
    <div className="section">
      <div className="container-page max-w-4xl">
        <p className="eyebrow">İletişim</p>
        <h1 className="h-section">Bize Ulaş</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Etkinlikler, katılım ve iş birliği için bizimle iletişime
          geçebilirsin. En hızlı yanıtı WhatsApp üzerinden alırsın.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {channels.map((channel) => (
            <div key={channel.title} className="card p-6">
              <h2 className="text-lg font-bold text-white">{channel.title}</h2>
              <p className="mt-1 text-sm text-zinc-400">{channel.description}</p>
              <div className="mt-4 flex flex-col gap-2">
                {channel.items
                  .filter((phone) => phone && phone.trim().length > 0)
                  .map((phone) => (
                    <a
                      key={phone}
                      href={channel.href(phone)}
                      target={channel.title === "WhatsApp" ? "_blank" : undefined}
                      rel={
                        channel.title === "WhatsApp"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="btn-secondary justify-between"
                    >
                      <span>{phone}</span>
                      <span className="text-xs font-semibold text-acid">
                        {channel.cta}
                      </span>
                    </a>
                  ))}
              </div>
            </div>
          ))}

          <div className="card p-6">
            <h2 className="text-lg font-bold text-white">Instagram</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Etkinlik duyurularını ve fotoğrafları Instagram&apos;da takip et.
            </p>
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-4"
            >
              @vanyouthclub
            </a>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-white">Konum</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Etkinliklerimiz Van il merkezi ve çevresindeki açık hava
              mekanlarında gerçekleşir. Her etkinliğin konumu detay sayfasında
              belirtilir.
            </p>
            <p className="mt-4 text-sm font-semibold text-acid">Van, Türkiye</p>
          </div>
        </div>
      </div>
    </div>
  );
}

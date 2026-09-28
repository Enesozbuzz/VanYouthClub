import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "VAN YOUTH CLUB nedir, nasıl çalışır ve Van'daki gençler için ne sunar? Topluluk anlayışımızı ve etkinlik yaklaşımımızı keşfet.",
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="section">
      <div className="container-page max-w-3xl">
        <p className="eyebrow">Hakkımızda</p>
        <h1 className="h-section">Gençleri bir araya getiren topluluk</h1>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-zinc-300">
          <p>
            <strong className="text-white">VAN YOUTH CLUB</strong>, Van&apos;daki
            gençlerin sosyal, kültürel, sportif ve topluluk odaklı etkinlikler
            aracılığıyla buluştuğu bir platformdur. Amacımız; gençlerin yeni
            insanlarla tanıştığı, birlikte deneyimlediği ve keyifli vakit
            geçirdiği bir ortak yaratmak.
          </p>
          <p>
            Etkinlik takvimimiz kamplardan akustik gecelere, oyun gecelerinden
            doğa sporlarına ve atölyelere kadar uzanan geniş bir yelpazede
            şekillenir. Her etkinlik, katılımcıların ilgi alanlarına ve
            topluluk dinamiklerine göre şekillendirilir.
          </p>
          <p>
            Van&apos;ın doğal güzelliklerini ve kültürel dokusunu keşfetmeyi,
            bu deneyimi arkadaş çevresiyle paylaşmayı hedefleyen gençler için
            düzenli buluşmalar organiz ediyoruz.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Sosyal & Kültürel",
              text: "Akustik geceler, kahve & tanışma buluşmaları ve açık hava sineması etkinlikleri.",
            },
            {
              title: "Spor & Doğa",
              text: "Doğa yürüyüşleri, kamp etkinlikleri ve açık hava sporları.",
            },
            {
              title: "Eğlence",
              text: "Game night geceleri, turnuvalar ve oyun etkinlikleri.",
            },
            {
              title: "Üretim",
              text: "Atölye & sanat etkinlikleriyle yeni beceriler keşfetme.",
            },
          ].map((item) => (
            <div key={item.title} className="card p-5">
              <h2 className="text-base font-bold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/events">Etkinlikleri Gör</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Bize Ulaş
          </ButtonLink>
        </div>

        <p className="mt-10 text-sm text-zinc-500">
          Instagram:{" "}
          <a
            href={settings.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-acid hover:underline"
          >
            @vanyouthclub
          </a>
        </p>
      </div>
    </div>
  );
}

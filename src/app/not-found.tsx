import Link from "next/link";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="section">
      <div className="container-page flex flex-col items-center gap-5 py-20 text-center">
        <p className="eyebrow">404</p>
        <h1 className="h-section">Sayfa bulunamadı</h1>
        <p className="max-w-md text-muted">
          Aradığın sayfa taşınmış, kaldırılmış veya hiç var olmamış olabilir.
        </p>
        <div className="flex gap-3">
          <ButtonLink href="/">Ana Sayfa</ButtonLink>
          <ButtonLink href="/events" variant="secondary">
            Etkinlikler
          </ButtonLink>
        </div>
        <p className="text-xs text-zinc-600">
          Etkinlik aradıysan:{" "}
          <Link href="/events" className="text-acid hover:underline">
            etkinlik listesi
          </Link>
        </p>
      </div>
    </div>
  );
}

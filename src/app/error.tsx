"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Technical details stay in the server log, never in the UI.
    console.error(error);
  }, [error]);

  return (
    <div className="section">
      <div className="container-page flex flex-col items-center gap-5 py-20 text-center">
        <p className="eyebrow">Hata</p>
        <h1 className="h-section">Bir şeyler ters gitti</h1>
        <p className="max-w-md text-muted">
          Beklenmeyen bir hata oluştu. Lütfen tekrar dene; sorun devam ederse
          bizimle iletişime geçebilirsin.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset}>Tekrar Dene</Button>
          <ButtonLink href="/" variant="secondary">
            Ana Sayfa
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

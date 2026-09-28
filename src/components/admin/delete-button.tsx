"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

/** Confirm + delete helper for admin lists. */
export function DeleteButton({
  endpoint,
  confirmMessage,
  label = "Sil",
}: {
  endpoint: string;
  confirmMessage: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Silinemedi");
        return;
      }
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="danger"
        onClick={onDelete}
        loading={loading}
        className="btn-sm"
      >
        {label}
      </Button>
      {error && <p className="max-w-[220px] text-right text-xs text-flame">{error}</p>}
    </div>
  );
}

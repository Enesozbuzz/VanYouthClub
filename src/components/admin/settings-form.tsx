"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field } from "@/components/ui";
import type { SiteSettings } from "@/lib/settings";

const FIELDS: Array<{ key: keyof SiteSettings; label: string; hint?: string }> = [
  { key: "site_title", label: "Site Başlığı" },
  { key: "site_description", label: "Site Açıklaması" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "phone_1", label: "Telefon 1", hint: "05XX XXX XX XX" },
  { key: "phone_2", label: "Telefon 2", hint: "05XX XXX XX XX" },
];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [values, setValues] = useState<SiteSettings>(settings);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 422 && data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Kaydedilemedi");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setFormError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-5 p-6" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-flame/30 bg-flame/10 px-4 py-3 text-sm text-flame"
        >
          {formError}
        </div>
      )}
      {saved && (
        <div
          role="status"
          className="rounded-xl border border-acid/30 bg-acid/10 px-4 py-3 text-sm text-acid"
        >
          Ayarlar kaydedildi.
        </div>
      )}

      {FIELDS.map((field) => (
        <Field
          key={field.key}
          label={field.label}
          htmlFor={field.key}
          error={errors[field.key]}
          hint={field.hint}
        >
          <input
            id={field.key}
            className="input"
            value={values[field.key]}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [field.key]: event.target.value,
              }))
            }
          />
        </Field>
      ))}

      <Button type="submit" loading={loading}>
        Kaydet
      </Button>
    </form>
  );
}

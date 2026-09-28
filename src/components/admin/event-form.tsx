"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { slugify, toDateTimeLocalValue } from "@/lib/utils";

export type EventFormCategory = { id: string; name: string };

export type EventFormInitial = {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  location: string;
  startAt: Date | string;
  endAt: Date | string;
  capacity: number | null;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
};

const STATUS_OPTIONS: Array<{
  value: EventFormInitial["status"];
  label: string;
}> = [
  { value: "DRAFT", label: "Taslak" },
  { value: "PUBLISHED", label: "Yayında" },
  { value: "COMPLETED", label: "Tamamlandı" },
  { value: "CANCELLED", label: "İptal Edildi" },
];

export function EventForm({
  mode,
  categories,
  initial,
}: {
  mode: "create" | "edit";
  categories: EventFormCategory[];
  initial?: EventFormInitial;
}) {
  const router = useRouter();

  const [values, setValues] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
    location: initial?.location ?? "",
    startAt: initial?.startAt ? toDateTimeLocalValue(initial.startAt) : "",
    endAt: initial?.endAt ? toDateTimeLocalValue(initial.endAt) : "",
    capacity: initial?.capacity != null ? String(initial.capacity) : "",
    coverImageUrl: initial?.coverImageUrl ?? "",
    status: initial?.status ?? ("DRAFT" as EventFormInitial["status"]),
  });
  const [slugLocked, setSlugLocked] = useState(mode === "edit");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function update(key: keyof typeof values, value: string) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && !slugLocked) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFormError(null);
    setErrors({});

    const payload = {
      ...values,
      capacity: values.capacity.trim() === "" ? null : Number(values.capacity),
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
    };

    try {
      const response = await fetch(
        mode === "create" ? "/api/admin/events" : `/api/admin/events/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 422 && data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Kaydedilemedi");
        return;
      }

      router.push("/admin/events");
      router.refresh();
    } catch {
      setFormError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setUploadError(data.error ?? "Görsel yüklenemedi");
        return;
      }
      setValues((current) => ({ ...current, coverImageUrl: data.url }));
    } catch {
      setUploadError("Bağlantı hatası");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-flame/30 bg-flame/10 px-4 py-3 text-sm text-flame"
        >
          {formError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Başlık" htmlFor="title" error={errors.title} className="sm:col-span-2">
          <input
            id="title"
            className="input"
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            required
            maxLength={120}
          />
        </Field>

        <Field
          label="Slug (URL)"
          htmlFor="slug"
          error={errors.slug}
          hint={slugLocked ? undefined : "Başlıktan otomatik oluşturulur"}
          className="sm:col-span-2"
        >
          <div className="flex gap-2">
            <input
              id="slug"
              className="input"
              value={values.slug}
              onChange={(event) => {
                setSlugLocked(true);
                update("slug", event.target.value);
              }}
              required
              maxLength={80}
            />
            {!slugLocked && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSlugLocked(true)}
              >
                Kilitle
              </Button>
            )}
          </div>
        </Field>

        <Field label="Kategori" htmlFor="categoryId" error={errors.categoryId}>
          <select
            id="categoryId"
            className="input"
            value={values.categoryId}
            onChange={(event) => update("categoryId", event.target.value)}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Konum" htmlFor="location" error={errors.location}>
          <input
            id="location"
            className="input"
            value={values.location}
            onChange={(event) => update("location", event.target.value)}
            required
            maxLength={200}
            placeholder="Örn. Van, Kazım Karabekir Parkı"
          />
        </Field>

        <Field label="Başlangıç" htmlFor="startAt" error={errors.startAt}>
          <input
            id="startAt"
            type="datetime-local"
            className="input"
            value={values.startAt}
            onChange={(event) => update("startAt", event.target.value)}
            required
          />
        </Field>

        <Field label="Bitiş" htmlFor="endAt" error={errors.endAt}>
          <input
            id="endAt"
            type="datetime-local"
            className="input"
            value={values.endAt}
            onChange={(event) => update("endAt", event.target.value)}
            required
          />
        </Field>

        <Field
          label="Kapasite (opsiyonel)"
          htmlFor="capacity"
          error={errors.capacity}
          hint="Boş bırakılırsa limitsiz"
        >
          <input
            id="capacity"
            type="number"
            min={1}
            className="input"
            value={values.capacity}
            onChange={(event) => update("capacity", event.target.value)}
          />
        </Field>

        <Field label="Durum" htmlFor="status" error={errors.status}>
          <select
            id="status"
            className="input"
            value={values.status}
            onChange={(event) => update("status", event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Kapak görseli URL"
          htmlFor="coverImageUrl"
          error={errors.coverImageUrl}
          hint="/uploads/... veya https://..."
          className="sm:col-span-2"
        >
          <input
            id="coverImageUrl"
            className="input"
            value={values.coverImageUrl}
            onChange={(event) => update("coverImageUrl", event.target.value)}
          />
        </Field>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="cover-upload">
            veya görsel yükle (JPG/PNG/WebP, max 5 MB)
          </label>
          <input
            id="cover-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="input file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white"
            onChange={(event) => onUpload(event.target.files?.[0])}
          />
          {uploading && <p className="mt-1 text-xs text-acid">Yükleniyor...</p>}
          {uploadError && <p className="field-error">{uploadError}</p>}
        </div>

        <Field
          label="Açıklama"
          htmlFor="description"
          error={errors.description}
          className="sm:col-span-2"
        >
          <textarea
            id="description"
            className="input min-h-[160px] resize-y"
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            required
            maxLength={5000}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-5">
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Etkinlik Oluştur" : "Değişiklikleri Kaydet"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/events")}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}

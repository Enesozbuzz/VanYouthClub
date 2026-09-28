"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { DeleteButton } from "./delete-button";

export type GalleryRow = {
  id: string;
  imageUrl: string;
  altText: string;
  title: string | null;
  sortOrder: number;
  isActive: boolean;
};

export function GalleryManager({ images }: { images: GalleryRow[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setErrors({ file: "Bir görsel seçin" });
      return;
    }
    setLoading(true);
    setErrors({});
    setFormError(null);

    try {
      const uploadData = new FormData();
      uploadData.set("file", file);
      const uploadResponse = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadData,
      });
      const uploadResult = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok) {
        if (uploadResponse.status === 422 && uploadResult.fields) {
          setErrors(uploadResult.fields);
        }
        setFormError(uploadResult.error ?? "Görsel yüklenemedi");
        return;
      }

      const createResponse = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadResult.url,
          altText,
          title: title || null,
          sortOrder: 0,
        }),
      });
      const createResult = await createResponse.json().catch(() => ({}));
      if (!createResponse.ok) {
        if (createResponse.status === 422 && createResult.fields) {
          setErrors(createResult.fields);
        }
        setFormError(createResult.error ?? "Galeriye eklenemedi");
        return;
      }

      setFile(null);
      setAltText("");
      setTitle("");
      router.refresh();
    } catch {
      setFormError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="card space-y-4 p-5" noValidate>
        <h2 className="text-base font-bold text-white">Yeni Görsel Ekle</h2>
        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-flame/30 bg-flame/10 px-4 py-3 text-sm text-flame"
          >
            {formError}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Görsel (JPG/PNG/WebP, max 5 MB)" htmlFor="gallery-file" error={errors.file}>
            <input
              id="gallery-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="input file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-white"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
          </Field>
          <Field label="Başlık (opsiyonel)" htmlFor="gallery-title">
            <input
              id="gallery-title"
              className="input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
            />
          </Field>
          <Field
            label="Alt metin (erişilebilirlik)"
            htmlFor="gallery-alt"
            error={errors.altText}
          >
            <input
              id="gallery-alt"
              className="input"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              required
              maxLength={200}
            />
          </Field>
        </div>
        <Button type="submit" loading={loading}>
          Yükle ve Ekle
        </Button>
      </form>

      {images.length === 0 ? (
        <p className="text-sm text-zinc-400">
          Galeri boş. Yukarıdaki formdan görsel ekleyebilirsin.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <li key={image.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.imageUrl}
                alt={image.altText}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {image.title ?? image.altText}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{image.imageUrl}</p>
                </div>
                <DeleteButton
                  endpoint={`/api/admin/gallery/${image.id}`}
                  confirmMessage="Bu görseli silmek istediğine emin misin?"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

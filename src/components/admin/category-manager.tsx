"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { DeleteButton } from "./delete-button";
import { slugify } from "@/lib/utils";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

type Draft = {
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
};

function toDraft(category: CategoryRow): Draft {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
  };
}

const EMPTY_DRAFT: Draft = {
  name: "",
  slug: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function startEdit(category: CategoryRow) {
    setEditingId(category.id);
    setDraft(toDraft(category));
    setErrors({});
    setFormError(null);
  }

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDraft.name,
          slug: newDraft.slug || slugify(newDraft.name),
          description: newDraft.description || null,
          sortOrder: Number(newDraft.sortOrder || 0),
          isActive: newDraft.isActive,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 422 && data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Eklenemedi");
        return;
      }
      setRows((current) => [...current, data.category]);
      setNewDraft(EMPTY_DRAFT);
      router.refresh();
    } catch {
      setFormError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    setLoading(true);
    setErrors({});
    setFormError(null);
    try {
      const response = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          slug: draft.slug || slugify(draft.name),
          description: draft.description || null,
          sortOrder: Number(draft.sortOrder || 0),
          isActive: draft.isActive,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 422 && data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Kaydedilemedi");
        return;
      }
      setRows((current) =>
        current.map((row) => (row.id === editingId ? data.category : row)),
      );
      setEditingId(null);
      router.refresh();
    } catch {
      setFormError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(category: CategoryRow) {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: !category.isActive,
        }),
      });
      if (!response.ok) return;
      const data = await response.json();
      setRows((current) =>
        current.map((row) => (row.id === category.id ? data.category : row)),
      );
      router.refresh();
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={submitCreate} className="card space-y-4 p-5" noValidate>
        <h2 className="text-base font-bold text-white">Yeni Kategori</h2>
        {formError && !editingId && (
          <div
            role="alert"
            className="rounded-xl border border-flame/30 bg-flame/10 px-4 py-3 text-sm text-flame"
          >
            {formError}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Ad" htmlFor="new-name" error={errors.name}>
            <input
              id="new-name"
              className="input"
              value={newDraft.name}
              onChange={(event) => {
                setNewDraft((current) => ({ ...current, name: event.target.value }));
              }}
              required
            />
          </Field>
          <Field label="Slug" htmlFor="new-slug" error={errors.slug}>
            <input
              id="new-slug"
              className="input"
              value={newDraft.slug}
              onChange={(event) =>
                setNewDraft((current) => ({ ...current, slug: event.target.value }))
              }
              placeholder={newDraft.name ? slugify(newDraft.name) : "otomatik"}
            />
          </Field>
          <Field label="Sıra" htmlFor="new-sort">
            <input
              id="new-sort"
              type="number"
              min={0}
              className="input"
              value={newDraft.sortOrder}
              onChange={(event) =>
                setNewDraft((current) => ({
                  ...current,
                  sortOrder: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Açıklama" htmlFor="new-description">
            <input
              id="new-description"
              className="input"
              value={newDraft.description}
              onChange={(event) =>
                setNewDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" loading={loading}>
            Ekle
          </Button>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={newDraft.isActive}
              onChange={(event) =>
                setNewDraft((current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-white/20 bg-ink-800"
            />
            Aktif
          </label>
        </div>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-5 py-3">Ad</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Sıra</th>
              <th className="px-5 py-3">Durum</th>
              <th className="px-5 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((category) =>
              editingId === category.id ? (
                <tr key={category.id} className="border-b border-white/5">
                  <td colSpan={5} className="px-5 py-4">
                    <form onSubmit={submitEdit} className="space-y-4" noValidate>
                      {formError && editingId && (
                        <div
                          role="alert"
                          className="rounded-xl border border-flame/30 bg-flame/10 px-4 py-3 text-sm text-flame"
                        >
                          {formError}
                        </div>
                      )}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Ad" htmlFor={`edit-name-${category.id}`} error={errors.name}>
                          <input
                            id={`edit-name-${category.id}`}
                            className="input"
                            value={draft.name}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            required
                          />
                        </Field>
                        <Field label="Slug" htmlFor={`edit-slug-${category.id}`} error={errors.slug}>
                          <input
                            id={`edit-slug-${category.id}`}
                            className="input"
                            value={draft.slug}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                slug: event.target.value,
                              }))
                            }
                            required
                          />
                        </Field>
                        <Field label="Sıra" htmlFor={`edit-sort-${category.id}`}>
                          <input
                            id={`edit-sort-${category.id}`}
                            type="number"
                            min={0}
                            className="input"
                            value={draft.sortOrder}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                sortOrder: event.target.value,
                              }))
                            }
                          />
                        </Field>
                        <Field label="Açıklama" htmlFor={`edit-desc-${category.id}`}>
                          <input
                            id={`edit-desc-${category.id}`}
                            className="input"
                            value={draft.description}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                description: event.target.value,
                              }))
                            }
                          />
                        </Field>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button type="submit" loading={loading}>
                          Kaydet
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Vazgeç
                        </Button>
                        <label className="flex items-center gap-2 text-sm text-zinc-300">
                          <input
                            type="checkbox"
                            checked={draft.isActive}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                isActive: event.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-white/20 bg-ink-800"
                          />
                          Aktif
                        </label>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={category.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-white">{category.name}</td>
                  <td className="px-5 py-3 text-zinc-400">{category.slug}</td>
                  <td className="px-5 py-3 text-zinc-400">{category.sortOrder}</td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(category)}
                      className={
                        category.isActive
                          ? "badge-acid cursor-pointer"
                          : "badge cursor-pointer hover:text-white"
                      }
                      aria-label={`${category.name} aktifliğini değiştir`}
                    >
                      {category.isActive ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="btn-sm"
                        onClick={() => startEdit(category)}
                      >
                        Düzenle
                      </Button>
                      <DeleteButton
                        endpoint={`/api/admin/categories/${category.id}`}
                        confirmMessage={`"${category.name}" kategorisini silmek istediğine emin misin?`}
                      />
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

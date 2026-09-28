import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

const optionalInt = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().positive().max(max).nullable(),
  );

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v),
    "Geçerli bir görsel adresi girin",
  );

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Geçerli bir tarih girin");

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Geçerli bir e-posta adresi girin")
    .max(200),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır")
    .max(200),
});

export const eventSchema = z
  .object({
    title: z.string().trim().min(3, "Başlık en az 3 karakter olmalı").max(120),
    slug: z
      .string()
      .trim()
      .regex(slugPattern, "Slug yalnızca küçük harf, rakam ve tire içerebilir")
      .max(80),
    description: z
      .string()
      .trim()
      .min(10, "Açıklama en az 10 karakter olmalı")
      .max(5000),
    categoryId: z.string().uuid("Kategori seçin"),
    location: z.string().trim().min(2, "Konum girin").max(200),
    startAt: isoDate,
    endAt: isoDate,
    capacity: optionalInt(100_000),
    coverImageUrl: imageUrl.transform((v) => (v === "" ? null : v)).nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: "Bitiş zamanı başlangıç zamanından sonra olmalı",
    path: ["endAt"],
  });

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Kategori adı en az 2 karakter olmalı").max(60),
  slug: z
    .string()
    .trim()
    .regex(slugPattern, "Slug yalnızca küçük harf, rakam ve tire içerebilir")
    .max(60),
  description: optionalString(300),
  sortOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0).max(999),
  ),
  isActive: z.preprocess((v) => v === true || v === "true" || v === "on", z.boolean()),
});

export const gallerySchema = z.object({
  imageUrl: imageUrl.refine((v) => v.length > 0, "Görsel adresi gerekli"),
  altText: z
    .string()
    .trim()
    .min(2, "Alt metin en az 2 karakter olmalı (erişilebilirlik)")
    .max(200),
  title: optionalString(120),
  sortOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0).max(999),
  ),
});

export const settingsSchema = z.object({
  site_title: z.string().trim().min(2, "Site başlığı en az 2 karakter olmalı").max(120),
  site_description: z
    .string()
    .trim()
    .min(10, "Site açıklaması en az 10 karakter olmalı")
    .max(300),
  instagram_url: z
    .string()
    .trim()
    .url("Geçerli bir Instagram bağlantısı girin")
    .max(300)
    .refine((v) => /^https?:\/\//.test(v), "Bağlantı http veya https ile başlamalı"),
  phone_1: z
    .string()
    .trim()
    .regex(/^0\d{10}$/, "Telefon numarası 05XX XXX XX XX formatında olmalı"),
  phone_2: z
    .string()
    .trim()
    .regex(/^0\d{10}$/, "Telefon numarası 05XX XXX XX XX formatında olmalı"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type GalleryInput = z.infer<typeof gallerySchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

/** Flatten Zod errors into a field -> message map. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

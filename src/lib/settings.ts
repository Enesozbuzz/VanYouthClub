import { eq } from "drizzle-orm";
import { db, siteSettings } from "./db";

/**
 * Site settings — small key/value store backed by site_settings (jsonb).
 * Only what the product actually needs; no CMS.
 */

export const SETTING_KEYS = [
  "site_title",
  "site_description",
  "instagram_url",
  "phone_1",
  "phone_2",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
export type SiteSettings = Record<SettingKey, string>;

export const DEFAULT_SETTINGS: SiteSettings = {
  site_title: "VAN YOUTH CLUB",
  site_description:
    "Van'daki gençleri sosyal, kültürel, sportif ve topluluk etkinliklerinde buluşturan platform.",
  instagram_url: "https://www.instagram.com/vanyouthclub/",
  phone_1: "0536 426 19 30",
  phone_2: "",
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(siteSettings);
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  const result: SiteSettings = { ...DEFAULT_SETTINGS };
  for (const key of SETTING_KEYS) {
    const value = stored.get(key);
    if (typeof value === "string" && value.trim().length > 0) {
      result[key] = value;
    }
  }
  return result;
}

export async function updateSettings(
  patch: Partial<SiteSettings>,
  adminId: string,
): Promise<void> {
  for (const [key, value] of Object.entries(patch)) {
    if (!SETTING_KEYS.includes(key as SettingKey)) continue;
    if (typeof value !== "string") continue;
    await db
      .insert(siteSettings)
      .values({ key, value, updatedByAdminId: adminId })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedByAdminId: adminId, updatedAt: new Date() },
      });
  }
}

/** "0536 426 19 30" -> "tel:+905364261930" */
export function phoneToTel(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "");
  return `tel:+90${digits}`;
}

/** "0536 426 19 30" -> "https://wa.me/905364261930" */
export function phoneToWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "");
  return `https://wa.me/90${digits}`;
}

/** Convenience used by layouts/pages to keep DB access out of components. */
export async function getSiteSettings(): Promise<SiteSettings> {
  return getSettings();
}

export const SETTING_KEY = eq;

import { eq } from "drizzle-orm";
import { db, admins, categories, events, galleryImages, siteSettings } from "./index";
import { hashPassword } from "../password";
import { DEFAULT_SETTINGS, SETTING_KEYS } from "../settings";

/**
 * Development seed: categories, site settings, first admin account and
 * sample content. Safe to run multiple times (idempotent upserts).
 */

const CATEGORIES = [
  { name: "Kamp", slug: "kamp", description: "Doğada kamplar ve kamp etkinlikleri", sortOrder: 1 },
  { name: "Game Night", slug: "game-night", description: "Oyun geceleri ve turnuvalar", sortOrder: 2 },
  { name: "Akustik", slug: "akustik", description: "Akustik performans geceleri", sortOrder: 3 },
  { name: "Gezi", slug: "gezi", description: "Van ve çevresi gezileri", sortOrder: 4 },
  { name: "Kahve & Tanışma", slug: "kahve-tanisma", description: "Kahve eşliğinde tanışma buluşmaları", sortOrder: 5 },
  { name: "Açık Hava Sineması", slug: "acik-hava-sinemasi", description: "Açık hava sinema geceleri", sortOrder: 6 },
  { name: "Doğa & Spor", slug: "doga-spor", description: "Doğa yürüyüşleri ve spor etkinlikleri", sortOrder: 7 },
  { name: "Atölye & Sanat", slug: "atolye-sanat", description: "Atölye ve sanat etkinlikleri", sortOrder: 8 },
];

function daysFromNow(days: number, hour: number, minute = 0): Date {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function seedCategories() {
  for (const category of CATEGORIES) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, category.slug))
      .limit(1);
    if (existing[0]) {
      await db
        .update(categories)
        .set(category)
        .where(eq(categories.id, existing[0].id));
    } else {
      await db.insert(categories).values(category);
    }
  }
  console.log(`✓ ${CATEGORIES.length} kategori hazır`);
}

async function seedSettings() {
  for (const key of SETTING_KEYS) {
    await db
      .insert(siteSettings)
      .values({ key, value: DEFAULT_SETTINGS[key] })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: DEFAULT_SETTINGS[key] },
      });
  }
  console.log("✓ site ayarları hazır");
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@vanyouthclub.local")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Vyc!Admin2026";

  const existing = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);

  if (existing[0]) {
    console.log(`✓ yönetici zaten mevcut: ${email}`);
    return;
  }

  await db.insert(admins).values({
    email,
    passwordHash: await hashPassword(password),
    fullName: "VanYouthClub Yönetici",
    role: "SUPER_ADMIN",
  });
  console.log(`✓ yönetici oluşturuldu: ${email}`);
}

async function seedEvents() {
  const existing = await db.select({ id: events.id }).from(events).limit(1);
  if (existing[0]) {
    console.log("✓ etkinlikler zaten mevcut");
    return;
  }

  const categoryBySlug = new Map(
    (
      await db.select({ id: categories.id, slug: categories.slug }).from(categories)
    ).map((row) => [row.slug, row.id]),
  );

  const id = (slug: string) => {
    const value = categoryBySlug.get(slug);
    if (!value) throw new Error(`Kategori bulunamadı: ${slug}`);
    return value;
  };

  const samples = [
    {
      title: "Van Gölü Çevresinde Kamp",
      slug: "van-golu-cevresinde-kamp",
      description:
        "Van Gölü'nün eşsiz manzarası eşliğinde iki günlük kamp etkinliğimiz. Çadır, kahvaltılık ve akşam ateşi etkinliği dahildir. Katılım kontenjanı sınırlıdır.",
      categoryId: id("kamp"),
      location: "Van Gölü Sahil Alanı",
      startAt: daysFromNow(12, 10),
      endAt: daysFromNow(13, 18),
      capacity: 40,
      coverImageUrl: "/media/seed/etkinlik-kamp.svg",
      status: "PUBLISHED" as const,
    },
    {
      title: "Akustik Akşam: Genç Müzisyenler",
      slug: "akustik-aksam-genc-muzisyenler",
      description:
        "Van'lı genç müzisyenlerin sahne alacağı akustik akşam. Kahve eşliğinde keyifli bir müzik gecesi.",
      categoryId: id("akustik"),
      location: "Merkez Kafe Bahçe",
      startAt: daysFromNow(20, 20),
      endAt: daysFromNow(20, 23),
      capacity: 60,
      coverImageUrl: "/media/seed/etkinlik-akustik.svg",
      status: "PUBLISHED" as const,
    },
    {
      title: "Game Night: Turnuva ve Eğlence",
      slug: "game-night-turnuva-ve-eglence",
      description:
        "Masa oyunları ve video oyun turnuvası. Ödüllü turnuva ve bol mola ikramları.",
      categoryId: id("game-night"),
      location: "Etkinlik Alanı",
      startAt: daysFromNow(27, 18),
      endAt: daysFromNow(27, 23),
      capacity: 50,
      coverImageUrl: "/media/seed/etkinlik-game-night.svg",
      status: "PUBLISHED" as const,
    },
    {
      title: "Muradiye Şelalesi Gezisi (Taslak)",
      slug: "muradiye-selalesi-gezisi",
      description:
        "Doğa yürüyüşü ve şelale gezisi. Detaylar planlandıkça güncellenecek.",
      categoryId: id("gezi"),
      location: "Muradiye Şelalesi",
      startAt: daysFromNow(45, 9),
      endAt: daysFromNow(45, 17),
      capacity: null,
      coverImageUrl: "/media/seed/etkinlik-gezi.svg",
      status: "DRAFT" as const,
    },
  ];

  for (const sample of samples) {
    await db.insert(events).values({
      ...sample,
      publishedAt: sample.status === "PUBLISHED" ? new Date() : null,
    });
  }
  console.log(`✓ ${samples.length} örnek etkinlik eklendi`);
}

async function seedGallery() {
  const existing = await db.select({ id: galleryImages.id }).from(galleryImages).limit(1);
  if (existing[0]) {
    console.log("✓ galeri görselleri zaten mevcut");
    return;
  }

  const items = [
    { imageUrl: "/media/seed/galeri-1.svg", altText: "Kamp etkinliğinde gençler", title: "Kamp", sortOrder: 1 },
    { imageUrl: "/media/seed/galeri-2.svg", altText: "Gezi etkinliğinde grup fotoğrafı", title: "Gezi", sortOrder: 2 },
    { imageUrl: "/media/seed/galeri-3.svg", altText: "Akustik akşam sahne görüntüsü", title: "Akustik Akşam", sortOrder: 3 },
    { imageUrl: "/media/seed/galeri-4.svg", altText: "Game night turnuva anı", title: "Game Night", sortOrder: 4 },
    { imageUrl: "/media/seed/galeri-5.svg", altText: "Doğa yürüyüşü manzarası", title: "Doğa & Spor", sortOrder: 5 },
    { imageUrl: "/media/seed/galeri-6.svg", altText: "Atölye çalışması", title: "Atölye", sortOrder: 6 },
  ];

  for (const item of items) {
    await db.insert(galleryImages).values(item);
  }
  console.log(`✓ ${items.length} galeri görseli eklendi`);
}

async function main() {
  await seedCategories();
  await seedSettings();
  await seedAdmin();
  await seedEvents();
  await seedGallery();
  console.log("Seed tamamlandı.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed hatası:", error);
    process.exit(1);
  });

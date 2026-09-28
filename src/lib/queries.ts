import { and, asc, desc, eq, gte, inArray, ne } from "drizzle-orm";
import { db, categories, events, galleryImages } from "./db";

type Event = typeof events.$inferSelect;

/**
 * All database reads for the application live here — pages and API routes
 * never talk to the database directly.
 */

export type EventWithCategory = Event & {
  category: { id: string; name: string; slug: string };
};

const eventWithCategorySelect = {
  event: events,
  category: {
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
  },
} as const;

function withCategory(
  row: { event: Event; category: EventWithCategory["category"] },
): EventWithCategory {
  return { ...row.event, category: row.category };
}

/* ------------------------------ public ------------------------------ */

export async function getUpcomingEvents(
  categorySlug?: string,
): Promise<EventWithCategory[]> {
  const conditions = [
    eq(events.status, "PUBLISHED"),
    gte(events.startAt, new Date()),
  ];

  if (categorySlug) {
    const categoryRows = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    const category = categoryRows[0];
    if (!category) return [];
    conditions.push(eq(events.categoryId, category.id));
  }

  const rows = await db
    .select(eventWithCategorySelect)
    .from(events)
    .innerJoin(categories, eq(events.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(asc(events.startAt));

  return rows.map(withCategory);
}

export async function getFeaturedEvents(limit = 6): Promise<EventWithCategory[]> {
  const rows = await db
    .select(eventWithCategorySelect)
    .from(events)
    .innerJoin(categories, eq(events.categoryId, categories.id))
    .where(and(eq(events.status, "PUBLISHED"), gte(events.startAt, new Date())))
    .orderBy(asc(events.startAt))
    .limit(limit);
  return rows.map(withCategory);
}

export async function getEventBySlug(
  slug: string,
): Promise<EventWithCategory | null> {
  const rows = await db
    .select(eventWithCategorySelect)
    .from(events)
    .innerJoin(categories, eq(events.categoryId, categories.id))
    .where(
      and(
        eq(events.slug, slug),
        inArray(events.status, ["PUBLISHED", "COMPLETED"]),
      ),
    )
    .limit(1);
  const row = rows[0];
  return row ? withCategory(row) : null;
}

export async function getRelatedEvents(
  eventId: string,
  categoryId: string,
  limit = 3,
): Promise<EventWithCategory[]> {
  const rows = await db
    .select(eventWithCategorySelect)
    .from(events)
    .innerJoin(categories, eq(events.categoryId, categories.id))
    .where(
      and(
        eq(events.status, "PUBLISHED"),
        eq(events.categoryId, categoryId),
        gte(events.startAt, new Date()),
        ne(events.id, eventId),
      ),
    )
    .orderBy(asc(events.startAt))
    .limit(limit);
  return rows.map(withCategory);
}

export async function getActiveCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getActiveGallery() {
  return db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.isActive, true))
    .orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt));
}

/* ------------------------------- admin ------------------------------ */

export async function getAllEventsAdmin(): Promise<EventWithCategory[]> {
  const rows = await db
    .select(eventWithCategorySelect)
    .from(events)
    .innerJoin(categories, eq(events.categoryId, categories.id))
    .orderBy(desc(events.startAt));
  return rows.map(withCategory);
}

export async function getEventByIdAdmin(id: string): Promise<EventWithCategory | null> {
  const rows = await db
    .select(eventWithCategorySelect)
    .from(events)
    .innerJoin(categories, eq(events.categoryId, categories.id))
    .where(eq(events.id, id))
    .limit(1);
  const row = rows[0];
  return row ? withCategory(row) : null;
}

export async function getAllCategoriesAdmin() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getAllGalleryAdmin() {
  return db
    .select()
    .from(galleryImages)
    .orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt));
}

export async function getDashboardStats() {
  const [allEvents, activeCategories, gallery] = await Promise.all([
    db.select({ status: events.status, startAt: events.startAt }).from(events),
    db.select({ id: categories.id }).from(categories).where(eq(categories.isActive, true)),
    db.select({ id: galleryImages.id }).from(galleryImages),
  ]);
  const now = new Date();
  return {
    totalEvents: allEvents.length,
    publishedEvents: allEvents.filter((e) => e.status === "PUBLISHED").length,
    upcomingEvents: allEvents.filter(
      (e) => e.status === "PUBLISHED" && e.startAt >= now,
    ).length,
    categories: activeCategories.length,
    galleryImages: gallery.length,
  };
}

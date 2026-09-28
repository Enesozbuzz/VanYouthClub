import { and, eq, ne } from "drizzle-orm";
import { db, categories, events } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { getClientIp, jsonError, jsonOk, readJsonBody, requireAdminApi } from "@/lib/api";
import { eventSchema, fieldErrors } from "@/lib/validation";

export async function POST(request: Request) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  const body = await readJsonBody(request);
  const parsed = eventSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Form doğrulaması başarısız", 422, fieldErrors(parsed.error));
  }
  const data = parsed.data;
  const ip = getClientIp(request);

  const categoryRows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.id, data.categoryId))
    .limit(1);
  if (!categoryRows[0]) {
    return jsonError("Seçilen kategori bulunamadı", 422, {
      categoryId: "Geçersiz kategori",
    });
  }

  const slugRows = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.slug, data.slug))
    .limit(1);
  if (slugRows[0]) {
    return jsonError("Bu slug zaten kullanılıyor", 422, {
      slug: "Bu adres başka bir etkinlikte kullanılıyor",
    });
  }

  const [created] = await db
    .insert(events)
    .values({
      title: data.title,
      slug: data.slug,
      description: data.description,
      categoryId: data.categoryId,
      location: data.location,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      capacity: data.capacity ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();

  await logAction({
    actorAdminId: guard.session.admin.id,
    action: "EVENT_CREATED",
    entityType: "event",
    entityId: created.id,
    entityLabel: created.title,
    metadata: { status: created.status, slug: created.slug },
    ipAddress: ip,
  });

  return jsonOk({ event: created }, 201);
}

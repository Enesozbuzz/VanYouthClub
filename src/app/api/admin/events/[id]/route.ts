import { and, eq, ne } from "drizzle-orm";
import { db, categories, events } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { getClientIp, jsonError, jsonOk, readJsonBody, requireAdminApi } from "@/lib/api";
import { eventSchema, fieldErrors } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const body = await readJsonBody(request);
  const parsed = eventSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Form doğrulaması başarısız", 422, fieldErrors(parsed.error));
  }
  const data = parsed.data;
  const ip = getClientIp(request);

  const existing = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);
  const current = existing[0];
  if (!current) {
    return jsonError("Etkinlik bulunamadı", 404);
  }

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
    .where(and(eq(events.slug, data.slug), ne(events.id, id)))
    .limit(1);
  if (slugRows[0]) {
    return jsonError("Bu slug zaten kullanılıyor", 422, {
      slug: "Bu adres başka bir etkinlikte kullanılıyor",
    });
  }

  const publishedAt =
    data.status === "PUBLISHED"
      ? (current.publishedAt ?? new Date())
      : current.publishedAt;

  const [updated] = await db
    .update(events)
    .set({
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
      publishedAt,
    })
    .where(eq(events.id, id))
    .returning();

  await logAction({
    actorAdminId: guard.session.admin.id,
    action: "EVENT_UPDATED",
    entityType: "event",
    entityId: updated.id,
    entityLabel: updated.title,
    metadata: { status: updated.status },
    ipAddress: ip,
  });

  return jsonOk({ event: updated });
}

export async function DELETE(request: Request, context: RouteContext) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const existing = await db.select().from(events).where(eq(events.id, id)).limit(1);
  const current = existing[0];
  if (!current) {
    return jsonError("Etkinlik bulunamadı", 404);
  }

  await db.delete(events).where(eq(events.id, id));

  await logAction({
    actorAdminId: guard.session.admin.id,
    action: "EVENT_DELETED",
    entityType: "event",
    entityId: current.id,
    entityLabel: current.title,
    metadata: { slug: current.slug, status: current.status },
    ipAddress: getClientIp(request),
  });

  return jsonOk({ ok: true });
}

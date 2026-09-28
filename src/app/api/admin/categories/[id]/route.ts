import { eq } from "drizzle-orm";
import { db, categories, events } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { getClientIp, jsonError, jsonOk, readJsonBody, requireAdminApi } from "@/lib/api";
import { categorySchema, fieldErrors } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const body = await readJsonBody(request);
  const parsed = categorySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Form doğrulaması başarısız", 422, fieldErrors(parsed.error));
  }
  const data = parsed.data;

  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  if (!existing[0]) {
    return jsonError("Kategori bulunamadı", 404);
  }

  const slugConflict = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, data.slug))
    .limit(1);
  if (slugConflict[0] && slugConflict[0].id !== id) {
    return jsonError("Bu slug zaten kullanılıyor", 409, {
      slug: "Bu slug başka bir kategoride kullanılıyor",
    });
  }

  const [updated] = await db
    .update(categories)
    .set({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    })
    .where(eq(categories.id, id))
    .returning();

  await logAction({
    actorAdminId: guard.session.admin.id,
    action: "CATEGORY_UPDATED",
    entityType: "category",
    entityId: updated.id,
    entityLabel: updated.name,
    ipAddress: getClientIp(request),
  });

  return jsonOk({ category: updated });
}

export async function DELETE(request: Request, context: RouteContext) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  const { id } = await context.params;

  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  if (!existing[0]) {
    return jsonError("Kategori bulunamadı", 404);
  }

  const linked = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.categoryId, id))
    .limit(1);
  if (linked[0]) {
    return jsonError(
      "Bu kategoriye bağlı etkinlikler var. Kategoriyi silmek yerine devre dışı bırakabilirsin.",
      409,
    );
  }

  await db.delete(categories).where(eq(categories.id, id));

  await logAction({
    actorAdminId: guard.session.admin.id,
    action: "CATEGORY_DELETED",
    entityType: "category",
    entityId: existing[0].id,
    entityLabel: existing[0].name,
    ipAddress: getClientIp(request),
  });

  return jsonOk({ ok: true });
}

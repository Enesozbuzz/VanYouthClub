import { eq } from "drizzle-orm";
import { db, categories } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { getClientIp, jsonError, jsonOk, readJsonBody, requireAdminApi } from "@/lib/api";
import { categorySchema, fieldErrors } from "@/lib/validation";

export async function POST(request: Request) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  const body = await readJsonBody(request);
  const parsed = categorySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Form doğrulaması başarısız", 422, fieldErrors(parsed.error));
  }
  const data = parsed.data;
  const ip = getClientIp(request);

  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, data.slug))
    .limit(1);
  if (existing[0]) {
    return jsonError("Bu slug zaten kullanılıyor", 409, {
      slug: "Bu slug başka bir kategoride kullanılıyor",
    });
  }

  const [created] = await db
    .insert(categories)
    .values({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    })
    .returning();

  await logAction({
    actorAdminId: guard.session.admin.id,
    action: "CATEGORY_CREATED",
    entityType: "category",
    entityId: created.id,
    entityLabel: created.name,
    ipAddress: ip,
  });

  return jsonOk({ category: created }, 201);
}

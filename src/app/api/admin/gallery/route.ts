import { db, galleryImages } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { getClientIp, jsonError, jsonOk, readJsonBody, requireAdminApi } from "@/lib/api";
import { fieldErrors, gallerySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  const body = await readJsonBody(request);
  const parsed = gallerySchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Form doğrulaması başarısız", 422, fieldErrors(parsed.error));
  }
  const data = parsed.data;

  const [created] = await db
    .insert(galleryImages)
    .values({
      imageUrl: data.imageUrl,
      altText: data.altText,
      title: data.title ?? null,
      sortOrder: data.sortOrder,
    })
    .returning();

  await logAction({
    actorAdminId: guard.session.admin.id,
    action: "GALLERY_IMAGE_ADDED",
    entityType: "gallery_image",
    entityId: created.id,
    entityLabel: created.title ?? created.altText,
    metadata: { imageUrl: created.imageUrl },
    ipAddress: getClientIp(request),
  });

  return jsonOk({ image: created }, 201);
}

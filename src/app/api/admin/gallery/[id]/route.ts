import { unlink } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db, galleryImages } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { getClientIp, jsonError, jsonOk, requireAdminApi } from "@/lib/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  const { id } = await context.params;
  const existing = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1);
  if (!existing[0]) {
    return jsonError("Görsel bulunamadı", 404);
  }

  await db.delete(galleryImages).where(eq(galleryImages.id, id));

  // Remove the uploaded file when it lives in our uploads directory.
  if (existing[0].imageUrl.startsWith("/uploads/")) {
    const filePath = path.join(
      process.cwd(),
      "public",
      existing[0].imageUrl.replace(/^\/+/, ""),
    );
    await unlink(filePath).catch(() => undefined);
  }

  await logAction({
    actorAdminId: guard.session.admin.id,
    action: "GALLERY_IMAGE_DELETED",
    entityType: "gallery_image",
    entityId: existing[0].id,
    entityLabel: existing[0].title ?? existing[0].altText,
    metadata: { imageUrl: existing[0].imageUrl },
    ipAddress: getClientIp(request),
  });

  return jsonOk({ ok: true });
}

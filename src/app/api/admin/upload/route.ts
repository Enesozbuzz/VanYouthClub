import { logAction } from "@/lib/audit";
import { getClientIp, jsonError, jsonOk, requireAdminApi } from "@/lib/api";
import { UploadError, saveImage } from "@/lib/upload";

export async function POST(request: Request) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Geçersiz dosya yüklemesi", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError("Dosya bulunamadı", 422, { file: "Bir görsel seçin" });
  }

  try {
    const url = await saveImage(file);

    await logAction({
      actorAdminId: guard.session.admin.id,
      action: "GALLERY_IMAGE_UPLOADED",
      entityType: "gallery_image",
      entityLabel: file.name,
      metadata: { url, size: file.size },
      ipAddress: getClientIp(request),
    });

    return jsonOk({ url }, 201);
  } catch (error) {
    if (error instanceof UploadError) {
      return jsonError(error.message, 422, { file: error.message });
    }
    console.error("[upload] unexpected error", error);
    return jsonError("Dosya yüklenirken bir hata oluştu", 500);
  }
}

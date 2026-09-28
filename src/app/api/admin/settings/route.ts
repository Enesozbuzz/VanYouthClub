import { logAction } from "@/lib/audit";
import {
  getClientIp,
  jsonError,
  jsonOk,
  readJsonBody,
  requireAdminApi,
} from "@/lib/api";
import { updateSettings } from "@/lib/settings";
import { fieldErrors, settingsSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const guard = await requireAdminApi(request);
  if (guard.response) return guard.response;

  const body = await readJsonBody(request);
  const parsed = settingsSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Form doğrulaması başarısız", 422, fieldErrors(parsed.error));
  }

  await updateSettings(parsed.data, guard.session.admin.id);

  await logAction({
    actorAdminId: guard.session.admin.id,
    action: "SETTINGS_UPDATED",
    entityType: "site_settings",
    entityId: null,
    entityLabel: "site_settings",
    metadata: { keys: Object.keys(parsed.data) },
    ipAddress: getClientIp(request),
  });

  return jsonOk({ ok: true });
}

import { clearSessionCookie, revokeSessionByToken } from "@/lib/auth";
import { assertSameOrigin, getClientIp, jsonError, jsonOk } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/constants";
import { logAction } from "@/lib/audit";
import { getSessionFromToken } from "@/lib/auth";

function readSessionToken(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === SESSION_COOKIE) return rest.join("=");
  }
  return undefined;
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return jsonError("Yetkisiz istek", 403);
  }

  const token = readSessionToken(request);
  const session = await getSessionFromToken(token);
  await revokeSessionByToken(token);
  await clearSessionCookie();

  await logAction({
    actorAdminId: session?.admin.id ?? null,
    action: "ADMIN_LOGOUT",
    entityType: "admin",
    entityId: session?.admin.id ?? null,
    entityLabel: session?.admin.email ?? null,
    ipAddress: getClientIp(request),
  });

  return jsonOk({ ok: true });
}

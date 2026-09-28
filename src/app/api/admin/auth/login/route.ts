import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, admins } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import {
  clearLoginAttempts,
  createSession,
  isLoginRateLimited,
  registerFailedLogin,
  setSessionCookie,
} from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { fieldErrors, loginSchema } from "@/lib/validation";
import { getClientIp, jsonError, jsonOk, readJsonBody } from "@/lib/api";

export async function POST(request: Request) {
  const body = await readJsonBody<{ email?: string; password?: string }>(request);
  const parsed = loginSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Geçersiz istek", 422, fieldErrors(parsed.error));
  }

  const { email, password } = parsed.data;
  const ip = getClientIp(request);
  const rateKey = `${email}|${ip ?? "unknown"}`;

  if (isLoginRateLimited(rateKey)) {
    return jsonError(
      "Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.",
      429,
    );
  }

  const rows = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);
  const admin = rows[0];

  const passwordValid = admin
    ? await verifyPassword(admin.passwordHash, password)
    : false;

  if (!admin || !passwordValid || !admin.isActive) {
    registerFailedLogin(rateKey);
    await logAction({
      actorAdminId: admin?.id ?? null,
      action: "ADMIN_LOGIN_FAILED",
      entityType: "admin",
      entityId: admin?.id ?? null,
      entityLabel: email,
      ipAddress: ip,
    });
    return jsonError("E-posta veya şifre hatalı", 401);
  }

  const token = await createSession(admin.id);
  await setSessionCookie(token);
  await db
    .update(admins)
    .set({ lastLoginAt: new Date() })
    .where(eq(admins.id, admin.id));
  clearLoginAttempts(rateKey);

  await logAction({
    actorAdminId: admin.id,
    action: "ADMIN_LOGIN",
    entityType: "admin",
    entityId: admin.id,
    entityLabel: admin.email,
    ipAddress: ip,
  });

  return jsonOk({
    admin: { email: admin.email, fullName: admin.fullName, role: admin.role },
  });
}

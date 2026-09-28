import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, admins, adminSessions } from "./db";
import { SESSION_COOKIE } from "./constants";

type Admin = typeof admins.$inferSelect;

/**
 * Session-based admin authentication.
 * - 256-bit random token, only its SHA-256 hash is stored in the database
 * - httpOnly cookie (Secure in production), SameSite=Lax
 * - server-side revocation supported
 */

export { SESSION_COOKIE };

const SESSION_TTL_DAYS = 7;

export type SessionAdmin = Pick<
  Admin,
  "id" | "email" | "fullName" | "role" | "isActive"
>;

export type AdminSessionInfo = {
  admin: SessionAdmin;
  sessionId: string;
  expiresAt: Date;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createSession(adminId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  await db.insert(adminSessions).values({
    adminId,
    tokenHash: hashToken(token),
    expiresAt,
  });
  return token;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  };
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
}

export async function getSessionFromToken(
  token: string | undefined,
): Promise<AdminSessionInfo | null> {
  if (!token) return null;
  const rows = await db
    .select({
      sessionId: adminSessions.id,
      expiresAt: adminSessions.expiresAt,
      admin: {
        id: admins.id,
        email: admins.email,
        fullName: admins.fullName,
        role: admins.role,
        isActive: admins.isActive,
      },
    })
    .from(adminSessions)
    .innerJoin(admins, eq(adminSessions.adminId, admins.id))
    .where(
      and(
        eq(adminSessions.tokenHash, hashToken(token)),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row || !row.admin.isActive) return null;
  return { admin: row.admin, sessionId: row.sessionId, expiresAt: row.expiresAt };
}

/** For server components / layouts. */
export async function getSession(): Promise<AdminSessionInfo | null> {
  const store = await cookies();
  return getSessionFromToken(store.get(SESSION_COOKIE)?.value);
}

/** For server components: redirects to login when unauthenticated. */
export async function requireAdmin(): Promise<AdminSessionInfo> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function revokeSessionByToken(
  token: string | undefined,
): Promise<void> {
  if (!token) return;
  await db
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(adminSessions.tokenHash, hashToken(token)), isNull(adminSessions.revokedAt)),
    );
}

export async function revokeAllSessionsForAdmin(adminId: string): Promise<void> {
  await db
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(adminSessions.adminId, adminId), isNull(adminSessions.revokedAt)));
}

/* ------------------------------------------------------------------ */
/* Login rate limiting (in-memory, per email + IP)                     */
/* ------------------------------------------------------------------ */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function isLoginRateLimited(key: string): boolean {
  const entry = attempts.get(key);
  return !!entry && entry.count >= MAX_ATTEMPTS && entry.resetAt > Date.now();
}

export function registerFailedLogin(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearLoginAttempts(key: string): void {
  attempts.delete(key);
}

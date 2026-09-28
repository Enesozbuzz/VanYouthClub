import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionFromToken } from "./auth";
import type { AdminSessionInfo } from "./auth";

/** Shared helpers for API route handlers. */

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonError(
  message: string,
  status: number,
  fields?: Record<string, string>,
): NextResponse {
  return NextResponse.json(
    { error: message, ...(fields ? { fields } : {}) },
    { status },
  );
}

export async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/** CSRF defense-in-depth: mutations must come from our own origin. */
export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients / same-origin GETs
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

function parseCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

export type AdminApiResult =
  | { session: AdminSessionInfo; response?: never }
  | { session?: never; response: NextResponse };

/** Authentication + authorization check for admin API routes. */
export async function requireAdminApi(request: Request): Promise<AdminApiResult> {
  if (!assertSameOrigin(request)) {
    return { response: jsonError("Yetkisiz istek", 403) };
  }
  const token = parseCookie(request.headers.get("cookie"), SESSION_COOKIE);
  const session = await getSessionFromToken(token);
  if (!session) {
    return { response: jsonError("Oturum bulunamadı veya süresi doldu", 401) };
  }
  return { session };
}

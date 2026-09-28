import { db, auditLogs } from "./db";

/**
 * Append-only audit trail for important admin operations.
 * Never updated or deleted through the application.
 */

export type AuditInput = {
  actorAdminId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  metadata?: unknown;
  ipAddress?: string | null;
};

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6 = /^[0-9a-fA-F:]+$/;

function sanitizeIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const value = ip.trim();
  if (IPV4.test(value) || (value.includes(":") && IPV6.test(value))) return value;
  return null;
}

export async function logAction(input: AuditInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorAdminId: input.actorAdminId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      entityLabel: input.entityLabel ?? null,
      metadata: (input.metadata ?? null) as Record<string, unknown> | null,
      ipAddress: sanitizeIp(input.ipAddress),
    });
  } catch (error) {
    // Auditing must never break the primary operation.
    console.error("[audit] failed to write audit log", error);
  }
}

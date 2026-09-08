export interface AuditLogEntry {
  action: string;
  targetEntity: string;
  targetId?: string;
  performedBy?: string;
  timestamp: string;
  details?: Record<string, any>;
}

/**
 * Server-side audit logging helper for administrative actions.
 * Structures mutation audit records for future persistent log integrations.
 */
export async function logAdminAction(
  action: string,
  targetEntity: string,
  targetId?: string,
  details?: Record<string, any>
): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    action,
    targetEntity,
    targetId,
    performedBy: process.env.NODE_ENV === "development" ? "dev-admin" : "system",
    timestamp: new Date().toISOString(),
    details,
  };

  // Log structured audit output in server environment logs
  console.log(`[ADMIN AUDIT LOG] ${JSON.stringify(entry)}`);

  return entry;
}

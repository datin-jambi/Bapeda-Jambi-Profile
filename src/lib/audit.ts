import { prisma } from "@/lib/prisma";

export async function createAuditLog(data: {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  oldData?: unknown;
  newData?: unknown;
}): Promise<void> {
  const serialize = (v: unknown) =>
    v != null ? (JSON.parse(JSON.stringify(v)) as object) : undefined;

  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldData: serialize(data.oldData),
        newData: serialize(data.newData),
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}

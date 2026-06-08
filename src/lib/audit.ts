import { prisma } from "@/lib/prisma";

export async function createAuditLog(data: {
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  oldData?: unknown;
  newData?: unknown;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldData: data.oldData ? (data.oldData as object) : undefined,
      newData: data.newData ? (data.newData as object) : undefined,
    },
  });
}

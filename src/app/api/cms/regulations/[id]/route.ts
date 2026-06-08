import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { regulationRepository } from "@/repositories/content.repository";
import { regulationSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:regulations")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  const body = await request.json();
  const parsed = regulationSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const updated = await regulationRepository.update(id, {
    ...parsed.data,
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
  });
  return ApiResponse.updated(updated, "Regulasi berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:regulations")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  await regulationRepository.delete(id);
  return ApiResponse.deleted("Regulasi berhasil dihapus");
});

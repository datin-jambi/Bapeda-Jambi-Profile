import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { faqRepository } from "@/repositories/content.repository";
import { faqSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler, resolveParams } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";

export const PUT = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:faq")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  const body = await request.json();
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const updated = await faqRepository.update(id, parsed.data);
  return ApiResponse.updated(updated, "FAQ berhasil diperbarui");
});

export const DELETE = withErrorHandler(async (request: NextRequest, ctx) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:faq")) throw new ForbiddenError();
  const { id } = await resolveParams(ctx);

  await faqRepository.delete(id);
  return ApiResponse.deleted("FAQ berhasil dihapus");
});

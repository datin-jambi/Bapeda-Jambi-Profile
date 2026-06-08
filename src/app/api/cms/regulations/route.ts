import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { regulationRepository } from "@/repositories/content.repository";
import { regulationSchema } from "@/lib/validations";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();

  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search") || undefined;

  const { data, total } = await regulationRepository.findAll({ skip, limit, search });
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:regulations")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = regulationSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const regulation = await regulationRepository.create({
    ...parsed.data,
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
  });
  return ApiResponse.created(regulation, "Regulasi berhasil dibuat");
});

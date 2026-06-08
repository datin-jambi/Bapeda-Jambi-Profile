import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { pageRepository } from "@/repositories/content.repository";
import { pageSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError, NotFoundError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const pages = await pageRepository.findAll();
  return ApiResponse.success(pages);
});

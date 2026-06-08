import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { uptdRepository } from "@/repositories/content.repository";
import { uptdSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const uptds = await uptdRepository.findAll();
  return ApiResponse.success(uptds);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:uptd")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = uptdSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const uptd = await uptdRepository.create(parsed.data);
  return ApiResponse.created(uptd, "UPTD berhasil dibuat");
});

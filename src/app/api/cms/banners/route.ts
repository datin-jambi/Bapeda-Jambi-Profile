import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { bannerRepository } from "@/repositories/content.repository";
import { bannerSchema } from "@/lib/validations";
import { ApiResponse } from "@/lib/api-response";
import { hasPermission } from "@/types";
import { withErrorHandler } from "@/lib/with-error-handler";
import { UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  const banners = await bannerRepository.findAll();
  return ApiResponse.success(banners);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getAuthUser();
  if (!user) throw new UnauthorizedError();
  if (!hasPermission(user.role, "manage:banners")) throw new ForbiddenError();

  const body = await request.json();
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Data tidak valid", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const banner = await bannerRepository.create(parsed.data);
  return ApiResponse.created(banner, "Banner berhasil dibuat");
});

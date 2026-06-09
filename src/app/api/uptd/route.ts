import { NextRequest } from "next/server";
import { uptdRepository } from "@/repositories/content.repository";
import { ApiResponse } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/with-error-handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const district = searchParams.get("district") ?? undefined;

  const data = await uptdRepository.findForPublicMap({ search, city, district });
  return ApiResponse.success(data);
});

import { NextRequest } from "next/server";
import { bannerRepository } from "@/repositories/content.repository";
import { ApiResponse, getPaginationParams, buildMeta } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search") || undefined;
  const activeParam = searchParams.get("active");
  const isActive = activeParam === "true" ? true : activeParam === "false" ? false : undefined;

  const { data, total } = await bannerRepository.findAll({ skip, limit, search, isActive });
  return ApiResponse.paginated(data, buildMeta(page, limit, total));
}

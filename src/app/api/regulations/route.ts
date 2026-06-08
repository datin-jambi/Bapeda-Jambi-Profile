import { NextRequest } from "next/server";
import { regulationRepository } from "@/repositories/content.repository";
import { getPaginationParams, paginatedResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const search = searchParams.get("search") || undefined;

  const { data, total } = await regulationRepository.findAll({ skip, limit, search });
  return paginatedResponse(data, total, page, limit);
}

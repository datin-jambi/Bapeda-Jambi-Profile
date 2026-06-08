import { NextRequest } from "next/server";
import { faqRepository } from "@/repositories/content.repository";
import { getPaginationParams, paginatedResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { page, limit, skip } = getPaginationParams(searchParams);
  const categoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId")!, 10)
    : undefined;

  const { data, total } = await faqRepository.findAll({ skip, limit, categoryId, isPublished: true });
  return paginatedResponse(data, total, page, limit);
}
